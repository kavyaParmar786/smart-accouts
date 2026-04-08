const Transaction = require('../models/transaction.model');
const { sendSuccess, sendError, sendPaginated } = require('../utils/response');
const { asyncHandler } = require('../middleware/error.middleware');
const mongoose = require('mongoose');

const getTransactions = asyncHandler(async (req, res) => {
  const { businessId, type, category, startDate, endDate, page = 1, limit = 20, search, paymentMethod } = req.query;
  if (!businessId) return sendError(res, 'businessId is required', 400);

  const filter = { business: businessId };
  if (type) filter.type = type;
  if (category) filter.category = category;
  if (paymentMethod) filter.paymentMethod = paymentMethod;
  if (search) filter.description = { $regex: search, $options: 'i' };
  if (startDate || endDate) {
    filter.date = {};
    if (startDate) filter.date.$gte = new Date(startDate);
    if (endDate) filter.date.$lte = new Date(endDate);
  }

  const total = await Transaction.countDocuments(filter);
  const transactions = await Transaction.find(filter)
    .sort({ date: -1 })
    .skip((page - 1) * limit)
    .limit(parseInt(limit))
    .populate('createdBy', 'name');

  sendPaginated(res, transactions, total, page, limit);
});

const getTransaction = asyncHandler(async (req, res) => {
  const transaction = await Transaction.findById(req.params.id).populate('createdBy', 'name');
  if (!transaction) return sendError(res, 'Transaction not found', 404);
  sendSuccess(res, { transaction });
});

const createTransaction = asyncHandler(async (req, res) => {
  const transaction = await Transaction.create({
    ...req.body,
    business: req.body.businessId,
    createdBy: req.user._id,
  });
  sendSuccess(res, { transaction }, 'Transaction created', 201);
});

const updateTransaction = asyncHandler(async (req, res) => {
  const transaction = await Transaction.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!transaction) return sendError(res, 'Transaction not found', 404);
  sendSuccess(res, { transaction }, 'Transaction updated');
});

const deleteTransaction = asyncHandler(async (req, res) => {
  await Transaction.findByIdAndDelete(req.params.id);
  sendSuccess(res, null, 'Transaction deleted');
});

const getSummary = asyncHandler(async (req, res) => {
  const { businessId, year = new Date().getFullYear() } = req.query;
  if (!businessId) return sendError(res, 'businessId is required', 400);

  const bid = new mongoose.Types.ObjectId(businessId);

  const monthly = await Transaction.aggregate([
    {
      $match: {
        business: bid,
        date: { $gte: new Date(`${year}-01-01`), $lte: new Date(`${year}-12-31`) },
      },
    },
    { $group: { _id: { month: { $month: '$date' }, type: '$type' }, total: { $sum: '$amount' } } },
    { $sort: { '_id.month': 1 } },
  ]);

  const byCategory = await Transaction.aggregate([
    {
      $match: {
        business: bid,
        date: { $gte: new Date(`${year}-01-01`), $lte: new Date(`${year}-12-31`) },
      },
    },
    { $group: { _id: { category: '$category', type: '$type' }, total: { $sum: '$amount' }, count: { $sum: 1 } } },
    { $sort: { total: -1 } },
  ]);

  const totals = await Transaction.aggregate([
    { $match: { business: bid } },
    { $group: { _id: '$type', total: { $sum: '$amount' }, count: { $sum: 1 } } },
  ]);

  sendSuccess(res, { monthly, byCategory, totals });
});

module.exports = { getTransactions, getTransaction, createTransaction, updateTransaction, deleteTransaction, getSummary };
