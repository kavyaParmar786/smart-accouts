const Transaction = require('../models/transaction.model');
const Invoice = require('../models/invoice.model');
const Product = require('../models/product.model');
const { sendSuccess, sendError } = require('../utils/response');
const { asyncHandler } = require('../middleware/error.middleware');
const mongoose = require('mongoose');

const toObjectId = (id) => new mongoose.Types.ObjectId(id);

const getDateRange = (startDate, endDate, year) => {
  if (startDate && endDate) {
    return { $gte: new Date(startDate), $lte: new Date(new Date(endDate).setHours(23,59,59)) };
  }
  const y = parseInt(year) || new Date().getFullYear();
  return { $gte: new Date(`${y}-01-01`), $lte: new Date(`${y}-12-31T23:59:59`) };
};

const getProfitLoss = asyncHandler(async (req, res) => {
  const { businessId, year, startDate, endDate } = req.query;
  if (!businessId) return sendError(res, 'businessId is required', 400);

  const dateRange = getDateRange(startDate, endDate, year);
  const bid = toObjectId(businessId);

  const results = await Transaction.aggregate([
    { $match: { business: bid, date: dateRange } },
    { $group: { _id: { type: '$type', category: '$category' }, total: { $sum: '$amount' }, count: { $sum: 1 } } },
    { $sort: { total: -1 } },
  ]);

  const income = { total: 0, breakdown: [] };
  const expenses = { total: 0, breakdown: [] };

  results.forEach(r => {
    const entry = { category: r._id.category, amount: r.total, count: r.count };
    if (r._id.type === 'income') { income.total += r.total; income.breakdown.push(entry); }
    else { expenses.total += r.total; expenses.breakdown.push(entry); }
  });

  income.breakdown.sort((a, b) => b.amount - a.amount);
  expenses.breakdown.sort((a, b) => b.amount - a.amount);

  const netProfit = income.total - expenses.total;
  const profitMargin = income.total > 0 ? ((netProfit / income.total) * 100).toFixed(2) : 0;

  sendSuccess(res, { income, expenses, netProfit, profitMargin });
});

const getMonthlyTrend = asyncHandler(async (req, res) => {
  const { businessId, year = new Date().getFullYear() } = req.query;
  if (!businessId) return sendError(res, 'businessId is required', 400);

  const y = parseInt(year);
  const bid = toObjectId(businessId);

  const data = await Transaction.aggregate([
    { $match: { business: bid, date: { $gte: new Date(`${y}-01-01`), $lte: new Date(`${y}-12-31T23:59:59`) } } },
    { $group: { _id: { month: { $month: '$date' }, type: '$type' }, total: { $sum: '$amount' } } },
    { $sort: { '_id.month': 1 } },
  ]);

  const months = Array.from({ length: 12 }, (_, i) => ({
    month: i + 1,
    monthName: new Date(y, i, 1).toLocaleString('default', { month: 'short' }),
    income: 0, expenses: 0, profit: 0,
  }));

  data.forEach(d => {
    const m = months[d._id.month - 1];
    if (d._id.type === 'income') m.income = d.total;
    else m.expenses = d.total;
  });
  months.forEach(m => { m.profit = m.income - m.expenses; });

  sendSuccess(res, { months, year: y });
});

const getCategoryBreakdown = asyncHandler(async (req, res) => {
  const { businessId, type = 'expense', year } = req.query;
  if (!businessId) return sendError(res, 'businessId is required', 400);

  const dateRange = getDateRange(null, null, year);
  const bid = toObjectId(businessId);

  const data = await Transaction.aggregate([
    { $match: { business: bid, type, date: dateRange } },
    { $group: { _id: '$category', total: { $sum: '$amount' }, count: { $sum: 1 } } },
    { $sort: { total: -1 } },
  ]);

  const grandTotal = data.reduce((s, d) => s + d.total, 0);
  const breakdown = data.map(d => ({
    category: d._id,
    amount: d.total,
    count: d.count,
    percentage: grandTotal > 0 ? ((d.total / grandTotal) * 100).toFixed(1) : 0,
  }));

  sendSuccess(res, { breakdown, grandTotal, type });
});

const getDashboardStats = asyncHandler(async (req, res) => {
  const { businessId } = req.query;
  if (!businessId) return sendError(res, 'businessId is required', 400);

  const bid = toObjectId(businessId);
  const now = new Date();
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

  const [thisMonth, lastMonth, invoiceStats, lowStockCount] = await Promise.all([
    Transaction.aggregate([
      { $match: { business: bid, date: { $gte: thisMonthStart } } },
      { $group: { _id: '$type', total: { $sum: '$amount' } } },
    ]),
    Transaction.aggregate([
      { $match: { business: bid, date: { $gte: lastMonthStart, $lte: lastMonthEnd } } },
      { $group: { _id: '$type', total: { $sum: '$amount' } } },
    ]),
    Invoice.aggregate([
      { $match: { business: bid } },
      { $group: { _id: '$status', total: { $sum: '$grandTotal' }, count: { $sum: 1 } } },
    ]),
    Product.countDocuments({
      business: businessId,
      isActive: true,
      $expr: { $lte: ['$quantity', '$lowStockThreshold'] },
    }),
  ]);

  const fmt = (arr) => {
    const r = { income: 0, expenses: 0 };
    arr.forEach(a => { if (a._id === 'income') r.income = a.total; else r.expenses = a.total; });
    return r;
  };

  const cur = fmt(thisMonth);
  const prev = fmt(lastMonth);
  const pct = (c, p) => p === 0 ? (c > 0 ? 100 : 0) : parseFloat((((c - p) / p) * 100).toFixed(1));

  const invFmt = { totalOutstanding: 0, totalPaid: 0, overdueCount: 0, counts: {}, amounts: {} };
  invoiceStats.forEach(s => {
    invFmt.counts[s._id] = s.count;
    invFmt.amounts[s._id] = s.total;
    if (s._id === 'sent') invFmt.totalOutstanding += s.total;
    if (s._id === 'paid') invFmt.totalPaid = s.total;
    if (s._id === 'overdue') { invFmt.totalOutstanding += s.total; invFmt.overdueCount = s.count; }
  });

  const insights = generateInsights(cur, prev, invFmt, lowStockCount);

  sendSuccess(res, {
    currentMonth: { ...cur, profit: cur.income - cur.expenses, month: now.toLocaleString('default', { month: 'long' }) },
    lastMonth: { ...prev, profit: prev.income - prev.expenses },
    changes: {
      income: pct(cur.income, prev.income),
      expenses: pct(cur.expenses, prev.expenses),
      profit: pct(cur.income - cur.expenses, prev.income - prev.expenses),
    },
    invoices: invFmt,
    lowStockCount,
    insights,
  });
});

const generateInsights = (cur, prev, invoices, lowStock) => {
  const insights = [];
  const incomeDiff  = prev.income   > 0 ? ((cur.income   - prev.income)   / prev.income)   * 100 : 0;
  const expenseDiff = prev.expenses > 0 ? ((cur.expenses - prev.expenses) / prev.expenses) * 100 : 0;

  if (incomeDiff > 20)
    insights.push({ type: 'positive', icon: '📈', message: `Income is up ${incomeDiff.toFixed(0)}% vs last month — great growth!` });
  else if (incomeDiff < -20)
    insights.push({ type: 'warning', icon: '📉', message: `Income dropped ${Math.abs(incomeDiff).toFixed(0)}% vs last month. Review your sales pipeline.` });

  if (expenseDiff > 30)
    insights.push({ type: 'warning', icon: '⚠️', message: `Expenses rose ${expenseDiff.toFixed(0)}% this month. Consider reviewing costs.` });
  else if (expenseDiff < -10)
    insights.push({ type: 'positive', icon: '✂️', message: `Expenses down ${Math.abs(expenseDiff).toFixed(0)}% — great cost control!` });

  if (invoices.overdueCount > 0)
    insights.push({ type: 'alert', icon: '🔔', message: `${invoices.overdueCount} invoice(s) are overdue. Follow up to improve cash flow.` });

  if (invoices.totalOutstanding > 0)
    insights.push({ type: 'info', icon: '💰', message: `₹${invoices.totalOutstanding.toLocaleString('en-IN')} outstanding in unpaid invoices.` });

  if (lowStock > 0)
    insights.push({ type: 'warning', icon: '📦', message: `${lowStock} product(s) are running low on stock. Reorder soon.` });

  if (cur.income > 0 && cur.expenses > cur.income)
    insights.push({ type: 'alert', icon: '🚨', message: `Expenses exceed income this month — you are operating at a loss.` });
  else if (cur.income > 0 && (cur.income - cur.expenses) > cur.income * 0.3)
    insights.push({ type: 'positive', icon: '🎯', message: `Profit margin above 30% this month — excellent financial health!` });

  return insights.slice(0, 4);
};

const exportTransactions = asyncHandler(async (req, res) => {
  const { businessId, type, year, startDate, endDate } = req.query;
  if (!businessId) return sendError(res, 'businessId is required', 400);

  const filter = { business: businessId };
  if (type) filter.type = type;
  filter.date = getDateRange(startDate, endDate, year);

  const transactions = await Transaction.find(filter).sort({ date: -1 }).limit(5000);
  sendSuccess(res, { transactions, count: transactions.length });
});

module.exports = { getProfitLoss, getMonthlyTrend, getCategoryBreakdown, getDashboardStats, exportTransactions };
