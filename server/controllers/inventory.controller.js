// Inventory Controller - Product CRUD + stock management
const Product = require('../models/product.model');
const { sendSuccess, sendError, sendPaginated } = require('../utils/response');
const { asyncHandler } = require('../middleware/error.middleware');
const mongoose = require('mongoose');

const getProducts = asyncHandler(async (req, res) => {
  const { businessId, page = 1, limit = 20, search, category, lowStock } = req.query;
  if (!businessId) return sendError(res, 'businessId is required', 400);

  const filter = { business: businessId, isActive: true };
  if (search) filter.name = { $regex: search, $options: 'i' };
  if (category) filter.category = category;
  if (lowStock === 'true') filter.$expr = { $lte: ['$quantity', '$lowStockThreshold'] };

  const total = await Product.countDocuments(filter);
  const products = await Product.find(filter)
    .sort({ name: 1 })
    .skip((page - 1) * limit)
    .limit(parseInt(limit));

  sendPaginated(res, products, total, page, limit);
});

const getProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) return sendError(res, 'Product not found', 404);
  sendSuccess(res, { product });
});

const createProduct = asyncHandler(async (req, res) => {
  const product = await Product.create({
    ...req.body,
    business: req.body.businessId,
    createdBy: req.user._id,
    stockHistory: req.body.quantity > 0
      ? [{ type: 'in', quantity: req.body.quantity, reason: 'Initial stock', date: new Date() }]
      : [],
  });
  sendSuccess(res, { product }, 'Product created', 201);
});

const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true, runValidators: true,
  });
  if (!product) return sendError(res, 'Product not found', 404);
  sendSuccess(res, { product }, 'Product updated');
});

const deleteProduct = asyncHandler(async (req, res) => {
  await Product.findByIdAndUpdate(req.params.id, { isActive: false });
  sendSuccess(res, null, 'Product deleted');
});

// Adjust stock (in/out/adjustment)
const adjustStock = asyncHandler(async (req, res) => {
  const { type, quantity, reason, reference } = req.body;
  const product = await Product.findById(req.params.id);
  if (!product) return sendError(res, 'Product not found', 404);

  if (type === 'out' && product.quantity < quantity) {
    return sendError(res, `Insufficient stock. Available: ${product.quantity}`, 400);
  }

  const delta = type === 'in' ? quantity : type === 'out' ? -quantity : quantity - product.quantity;
  product.quantity += delta;
  product.stockHistory.push({ type, quantity, reason, reference, date: new Date() });
  await product.save();

  sendSuccess(res, { product }, 'Stock adjusted');
});

// Get inventory stats
const getInventoryStats = asyncHandler(async (req, res) => {
  const { businessId } = req.query;
  if (!businessId) return sendError(res, 'businessId is required', 400);

  const stats = await Product.aggregate([
    { $match: { business: new mongoose.Types.ObjectId(businessId), isActive: true } },
    {
      $group: {
        _id: null,
        totalProducts: { $sum: 1 },
        totalValue: { $sum: { $multiply: ['$quantity', '$costPrice'] } },
        totalRetailValue: { $sum: { $multiply: ['$quantity', '$price'] } },
        lowStockCount: {
          $sum: { $cond: [{ $lte: ['$quantity', '$lowStockThreshold'] }, 1, 0] },
        },
        outOfStockCount: {
          $sum: { $cond: [{ $eq: ['$quantity', 0] }, 1, 0] },
        },
      },
    },
  ]);

  const lowStockItems = await Product.find({
    business: businessId,
    isActive: true,
    $expr: { $lte: ['$quantity', '$lowStockThreshold'] },
  }).select('name quantity lowStockThreshold unit').limit(10);

  sendSuccess(res, { stats: stats[0] || {}, lowStockItems });
});

module.exports = { getProducts, getProduct, createProduct, updateProduct, deleteProduct, adjustStock, getInventoryStats };
