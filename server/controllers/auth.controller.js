// Auth Controller - Register, Login, Profile
const User = require('../models/user.model');
const Business = require('../models/business.model');
const Category = require('../models/category.model');
const { generateToken } = require('../utils/jwt');
const { sendSuccess, sendError } = require('../utils/response');
const { asyncHandler } = require('../middleware/error.middleware');

// Default categories seeded for new businesses
const DEFAULT_CATEGORIES = [
  { name: 'Sales', type: 'income', color: '#10b981', icon: '💰' },
  { name: 'Service', type: 'income', color: '#3b82f6', icon: '🔧' },
  { name: 'Investment', type: 'income', color: '#8b5cf6', icon: '📈' },
  { name: 'Other Income', type: 'income', color: '#f59e0b', icon: '💵' },
  { name: 'Rent', type: 'expense', color: '#ef4444', icon: '🏢' },
  { name: 'Salary', type: 'expense', color: '#f97316', icon: '👥' },
  { name: 'Utilities', type: 'expense', color: '#eab308', icon: '💡' },
  { name: 'Marketing', type: 'expense', color: '#ec4899', icon: '📢' },
  { name: 'Travel', type: 'expense', color: '#06b6d4', icon: '✈️' },
  { name: 'Food', type: 'expense', color: '#84cc16', icon: '🍽️' },
  { name: 'Software', type: 'expense', color: '#6366f1', icon: '💻' },
  { name: 'Other Expense', type: 'expense', color: '#94a3b8', icon: '📋' },
];

// @desc    Register new user
// @route   POST /api/auth/register
const register = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return sendError(res, 'Email already registered', 409);
  }

  const user = await User.create({ name, email, password, role });

  // Create a default business for new users
  const business = await Business.create({
    name: `${name}'s Business`,
    type: 'service',
    owner: user._id,
  });

  // Seed default categories
  const categories = DEFAULT_CATEGORIES.map(cat => ({
    ...cat,
    business: business._id,
    isDefault: true,
  }));
  await Category.insertMany(categories);

  // Link business to user
  user.businesses.push({ business: business._id, role: 'owner' });
  user.activeBusiness = business._id;
  await user.save();

  const token = generateToken({ id: user._id, role: user.role });

  sendSuccess(res, {
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      activeBusiness: business._id,
    },
  }, 'Registration successful', 201);
});

// @desc    Login user
// @route   POST /api/auth/login
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+password')
    .populate('businesses.business', 'name type')
    .populate('activeBusiness', 'name type gstin');

  if (!user || !(await user.comparePassword(password))) {
    return sendError(res, 'Invalid email or password', 401);
  }

  if (!user.isActive) {
    return sendError(res, 'Account deactivated. Contact support.', 403);
  }

  user.lastLogin = new Date();
  await user.save({ validateBeforeSave: false });

  const token = generateToken({ id: user._id, role: user.role });

  sendSuccess(res, {
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      activeBusiness: user.activeBusiness,
      businesses: user.businesses,
      lastLogin: user.lastLogin,
    },
  }, 'Login successful');
});

// @desc    Get current user profile
// @route   GET /api/auth/me
const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)
    .populate('businesses.business', 'name type logo gstin')
    .populate('activeBusiness', 'name type logo gstin currency');

  sendSuccess(res, { user });
});

// @desc    Update profile
// @route   PUT /api/auth/profile
const updateProfile = asyncHandler(async (req, res) => {
  const { name, avatar } = req.body;
  const user = await User.findByIdAndUpdate(
    req.user._id,
    { name, avatar },
    { new: true, runValidators: true }
  );
  sendSuccess(res, { user }, 'Profile updated');
});

// @desc    Change password
// @route   PUT /api/auth/change-password
const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user._id).select('+password');

  if (!(await user.comparePassword(currentPassword))) {
    return sendError(res, 'Current password is incorrect', 400);
  }

  user.password = newPassword;
  await user.save();
  sendSuccess(res, null, 'Password changed successfully');
});

// @desc    Switch active business
// @route   PUT /api/auth/switch-business/:businessId
const switchBusiness = asyncHandler(async (req, res) => {
  const { businessId } = req.params;

  const hasAccess = req.user.businesses.some(
    b => b.business.toString() === businessId
  );

  if (!hasAccess) {
    return sendError(res, 'Access denied', 403);
  }

  await User.findByIdAndUpdate(req.user._id, { activeBusiness: businessId });

  const business = await Business.findById(businessId);
  sendSuccess(res, { activeBusiness: business }, 'Business switched');
});

module.exports = { register, login, getMe, updateProfile, changePassword, switchBusiness };
