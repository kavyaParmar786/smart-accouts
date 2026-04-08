// Authentication & authorization middleware
const { verifyToken } = require('../utils/jwt');
const User = require('../models/user.model');
const { asyncHandler } = require('./error.middleware');

// Protect routes - verify JWT
const protect = asyncHandler(async (req, res, next) => {
  let token;
  
  if (req.headers.authorization?.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized, no token' });
  }

  const decoded = verifyToken(token);
  req.user = await User.findById(decoded.id).select('-password');
  
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'User not found' });
  }

  next();
});

// Role-based access control
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Role '${req.user.role}' is not authorized for this action`,
      });
    }
    next();
  };
};

// Verify user has access to the requested business
const verifyBusinessAccess = asyncHandler(async (req, res, next) => {
  const businessId = req.params.businessId || req.body.businessId || req.query.businessId;
  
  if (!businessId) return next();

  const hasAccess = req.user.businesses.some(
    b => b.business.toString() === businessId
  );

  if (!hasAccess && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied to this business',
    });
  }

  req.businessId = businessId;
  next();
});

module.exports = { protect, authorize, verifyBusinessAccess };
