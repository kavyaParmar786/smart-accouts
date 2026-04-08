const Category = require('../models/category.model');
const { sendSuccess, sendError } = require('../utils/response');
const { asyncHandler } = require('../middleware/error.middleware');

const getCategories = asyncHandler(async (req, res) => {
  const { businessId, type } = req.query;
  if (!businessId) return sendError(res, 'businessId is required', 400);
  const filter = { business: businessId, isActive: true };
  if (type && type !== 'both') filter.type = { $in: [type, 'both'] };
  const categories = await Category.find(filter).sort({ isDefault: -1, name: 1 });
  sendSuccess(res, { categories });
});

const createCategory = asyncHandler(async (req, res) => {
  const category = await Category.create({ ...req.body, business: req.body.businessId });
  sendSuccess(res, { category }, 'Category created', 201);
});

const updateCategory = asyncHandler(async (req, res) => {
  const category = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!category) return sendError(res, 'Category not found', 404);
  sendSuccess(res, { category }, 'Category updated');
});

const deleteCategory = asyncHandler(async (req, res) => {
  const cat = await Category.findById(req.params.id);
  if (!cat) return sendError(res, 'Category not found', 404);
  if (cat.isDefault) return sendError(res, 'Cannot delete default categories', 400);
  await cat.deleteOne();
  sendSuccess(res, null, 'Category deleted');
});

module.exports = { getCategories, createCategory, updateCategory, deleteCategory };
