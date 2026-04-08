// Business Controller
const Business = require('../models/business.model');
const User = require('../models/user.model');
const Category = require('../models/category.model');
const { sendSuccess, sendError } = require('../utils/response');
const { asyncHandler } = require('../middleware/error.middleware');

const DEFAULT_CATEGORIES = [
  { name: 'Sales', type: 'income', color: '#10b981', icon: '💰', isDefault: true },
  { name: 'Service', type: 'income', color: '#3b82f6', icon: '🔧', isDefault: true },
  { name: 'Investment', type: 'income', color: '#8b5cf6', icon: '📈', isDefault: true },
  { name: 'Other Income', type: 'income', color: '#f59e0b', icon: '💵', isDefault: true },
  { name: 'Rent', type: 'expense', color: '#ef4444', icon: '🏢', isDefault: true },
  { name: 'Salary', type: 'expense', color: '#f97316', icon: '👥', isDefault: true },
  { name: 'Utilities', type: 'expense', color: '#eab308', icon: '💡', isDefault: true },
  { name: 'Marketing', type: 'expense', color: '#ec4899', icon: '📢', isDefault: true },
  { name: 'Travel', type: 'expense', color: '#06b6d4', icon: '✈️', isDefault: true },
  { name: 'Other Expense', type: 'expense', color: '#94a3b8', icon: '📋', isDefault: true },
];

// @desc    Get all businesses for current user
// @route   GET /api/businesses
const getBusinesses = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate('businesses.business');
  const businesses = user.businesses.map(b => ({ ...b.business._doc, userRole: b.role }));
  sendSuccess(res, { businesses });
});

// @desc    Get single business
// @route   GET /api/businesses/:id
const getBusiness = asyncHandler(async (req, res) => {
  const business = await Business.findById(req.params.id);
  if (!business) return sendError(res, 'Business not found', 404);
  sendSuccess(res, { business });
});

// @desc    Create new business
// @route   POST /api/businesses
const createBusiness = asyncHandler(async (req, res) => {
  const business = await Business.create({
    ...req.body,
    owner: req.user._id,
  });

  // Seed default categories
  const categories = DEFAULT_CATEGORIES.map(cat => ({ ...cat, business: business._id }));
  await Category.insertMany(categories);

  // Add to user's businesses list
  await User.findByIdAndUpdate(req.user._id, {
    $push: { businesses: { business: business._id, role: 'owner' } },
    activeBusiness: business._id,
  });

  sendSuccess(res, { business }, 'Business created', 201);
});

// @desc    Update business
// @route   PUT /api/businesses/:id
const updateBusiness = asyncHandler(async (req, res) => {
  const business = await Business.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!business) return sendError(res, 'Business not found', 404);
  sendSuccess(res, { business }, 'Business updated');
});

// @desc    Delete business
// @route   DELETE /api/businesses/:id
const deleteBusiness = asyncHandler(async (req, res) => {
  await Business.findByIdAndDelete(req.params.id);
  await User.findByIdAndUpdate(req.user._id, {
    $pull: { businesses: { business: req.params.id } },
  });
  sendSuccess(res, null, 'Business deleted');
});

module.exports = { getBusinesses, getBusiness, createBusiness, updateBusiness, deleteBusiness };
