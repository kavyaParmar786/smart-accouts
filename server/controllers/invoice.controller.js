// Invoice Controller - Full CRUD + payment tracking
const Invoice = require('../models/invoice.model');
const Business = require('../models/business.model');
const Transaction = require('../models/transaction.model');
const { sendSuccess, sendError, sendPaginated } = require('../utils/response');
const { asyncHandler } = require('../middleware/error.middleware');
const mongoose = require('mongoose');

const getInvoices = asyncHandler(async (req, res) => {
  const { businessId, status, page = 1, limit = 20, search, startDate, endDate } = req.query;
  if (!businessId) return sendError(res, 'businessId is required', 400);

  const filter = { business: businessId };
  if (status) filter.status = status;
  if (search) {
    filter.$or = [
      { invoiceNumber: { $regex: search, $options: 'i' } },
      { 'customer.name': { $regex: search, $options: 'i' } },
    ];
  }
  if (startDate || endDate) {
    filter.issueDate = {};
    if (startDate) filter.issueDate.$gte = new Date(startDate);
    if (endDate) filter.issueDate.$lte = new Date(endDate);
  }

  const total = await Invoice.countDocuments(filter);
  const invoices = await Invoice.find(filter)
    .sort({ issueDate: -1 })
    .skip((page - 1) * limit)
    .limit(parseInt(limit));

  sendPaginated(res, invoices, total, page, limit);
});

const getInvoice = asyncHandler(async (req, res) => {
  const invoice = await Invoice.findById(req.params.id)
    .populate('business', 'name address gstin contact logo currency');
  if (!invoice) return sendError(res, 'Invoice not found', 404);
  sendSuccess(res, { invoice });
});

const createInvoice = asyncHandler(async (req, res) => {
  const { businessId } = req.body;
  const business = await Business.findByIdAndUpdate(
    businessId,
    { $inc: { invoiceCounter: 1 } },
    { new: false }
  );
  if (!business) return sendError(res, 'Business not found', 404);

  const invoiceNumber = `${business.invoicePrefix || 'INV'}-${String(business.invoiceCounter).padStart(4, '0')}`;

  const invoice = await Invoice.create({
    ...req.body,
    business: businessId,
    createdBy: req.user._id,
    invoiceNumber,
  });

  sendSuccess(res, { invoice }, 'Invoice created', 201);
});

const updateInvoice = asyncHandler(async (req, res) => {
  const invoice = await Invoice.findById(req.params.id);
  if (!invoice) return sendError(res, 'Invoice not found', 404);
  if (['paid', 'cancelled'].includes(invoice.status) && !req.body.status) {
    return sendError(res, `Cannot edit a ${invoice.status} invoice`, 400);
  }
  Object.assign(invoice, req.body);
  await invoice.save();
  sendSuccess(res, { invoice }, 'Invoice updated');
});

const deleteInvoice = asyncHandler(async (req, res) => {
  const invoice = await Invoice.findById(req.params.id);
  if (!invoice) return sendError(res, 'Invoice not found', 404);
  if (invoice.status === 'paid') return sendError(res, 'Cannot delete a paid invoice', 400);
  await invoice.deleteOne();
  sendSuccess(res, null, 'Invoice deleted');
});

const recordPayment = asyncHandler(async (req, res) => {
  const { amount, method, note, date } = req.body;
  const invoice = await Invoice.findById(req.params.id);
  if (!invoice) return sendError(res, 'Invoice not found', 404);

  const remaining = invoice.grandTotal - invoice.amountPaid;
  if (amount > remaining) {
    return sendError(res, `Payment exceeds outstanding amount of ${remaining}`, 400);
  }

  invoice.amountPaid += amount;
  invoice.paymentHistory.push({ amount, method, note, date: date || new Date() });

  if (invoice.amountPaid >= invoice.grandTotal) {
    invoice.status = 'paid';
    invoice.paidDate = new Date();
    await Transaction.create({
      business: invoice.business,
      createdBy: req.user._id,
      type: 'income',
      amount: invoice.grandTotal,
      category: 'Sales',
      description: `Payment received for ${invoice.invoiceNumber}`,
      date: invoice.paidDate,
      paymentMethod: method || 'bank',
      reference: invoice.invoiceNumber,
      invoice: invoice._id,
    });
  }

  await invoice.save();
  sendSuccess(res, { invoice }, 'Payment recorded');
});

const getInvoiceStats = asyncHandler(async (req, res) => {
  const { businessId } = req.query;
  if (!businessId) return sendError(res, 'businessId is required', 400);

  const stats = await Invoice.aggregate([
    { $match: { business: new mongoose.Types.ObjectId(businessId) } },
    { $group: { _id: '$status', count: { $sum: 1 }, total: { $sum: '$grandTotal' } } },
  ]);

  const counts = { draft: 0, sent: 0, paid: 0, overdue: 0, cancelled: 0 };
  const amounts = { draft: 0, sent: 0, paid: 0, overdue: 0, cancelled: 0 };
  stats.forEach(s => { counts[s._id] = s.count; amounts[s._id] = s.total; });

  sendSuccess(res, { counts, amounts });
});

module.exports = { getInvoices, getInvoice, createInvoice, updateInvoice, deleteInvoice, recordPayment, getInvoiceStats };
