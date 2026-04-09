/**
 * Team Controller
 * Lets business owners invite, manage, and remove staff from a business.
 * A single User account can belong to multiple businesses with different roles.
 */
const User     = require('../models/user.model');
const Business = require('../models/business.model');
const Invite   = require('../models/invite.model');
const { sendSuccess, sendError } = require('../utils/response');
const { asyncHandler }           = require('../middleware/error.middleware');
const { generateToken }          = require('../utils/jwt');
const bcrypt = require('bcryptjs');

// GET /api/team?businessId=
// Returns all members of a business
const getMembers = asyncHandler(async (req, res) => {
  const { businessId } = req.query;
  if (!businessId) return sendError(res, 'businessId is required', 400);

  // Find all users who have this business in their businesses array
  const members = await User.find({
    'businesses.business': businessId,
    isActive: true,
  }).select('name email role lastLogin createdAt businesses');

  const formatted = members.map(u => {
    const entry = u.businesses.find(b => b.business?.toString() === businessId);
    return {
      _id:        u._id,
      name:       u.name,
      email:      u.email,
      role:       u.role,
      bizRole:    entry?.role || 'staff',   // owner | admin | staff
      lastLogin:  u.lastLogin,
      joinedAt:   u.createdAt,
      isOwner:    entry?.role === 'owner',
    };
  });

  sendSuccess(res, { members: formatted });
});

// POST /api/team/invite
// Invite an existing user OR create a new staff account and add them
const inviteMember = asyncHandler(async (req, res) => {
  const { businessId, email, role = 'staff', name } = req.body;
  if (!businessId || !email) return sendError(res, 'businessId and email are required', 400);

  // Verify requester is owner/admin of that business
  const requester = req.user;
  const requesterEntry = requester.businesses.find(b => b.business?.toString() === businessId);
  if (!requesterEntry || !['owner','admin'].includes(requesterEntry.role)) {
    return sendError(res, 'Only owners and admins can invite members', 403);
  }

  const business = await Business.findById(businessId);
  if (!business) return sendError(res, 'Business not found', 404);

  // Check if user already exists
  let targetUser = await User.findOne({ email: email.toLowerCase() });

  if (targetUser) {
    // Check if already a member
    const alreadyMember = targetUser.businesses.some(b => b.business?.toString() === businessId);
    if (alreadyMember) return sendError(res, 'User is already a member of this business', 409);

    // Add business to existing user
    await User.findByIdAndUpdate(targetUser._id, {
      $push: { businesses: { business: businessId, role } },
    });

    return sendSuccess(res, {
      message: `${targetUser.name} added to ${business.name}`,
      user: { _id: targetUser._id, name: targetUser.name, email: targetUser.email, bizRole: role },
      isNewUser: false,
    }, 'Member added successfully', 201);
  }

  // User doesn't exist — create a staff account
  if (!name) return sendError(res, 'Name is required to create a new staff account', 400);

  // Generate a temporary password
  const tempPassword = Math.random().toString(36).slice(-8) + 'A1!';

  const newUser = await User.create({
    name,
    email: email.toLowerCase(),
    password: tempPassword,
    role: 'staff',
    businesses: [{ business: businessId, role }],
    activeBusiness: businessId,
  });

  return sendSuccess(res, {
    message: `New staff account created for ${name}`,
    user: { _id: newUser._id, name: newUser.name, email: newUser.email, bizRole: role },
    tempPassword,   // In production: send this via email, not in response
    isNewUser: true,
  }, 'Staff account created', 201);
});

// PUT /api/team/:userId/role
// Change a member's role within a business
const updateMemberRole = asyncHandler(async (req, res) => {
  const { userId }    = req.params;
  const { businessId, role } = req.body;

  if (!['admin','staff'].includes(role)) {
    return sendError(res, 'Role must be admin or staff (cannot change owner)', 400);
  }

  // Only owners can change roles
  const requesterEntry = req.user.businesses.find(b => b.business?.toString() === businessId);
  if (requesterEntry?.role !== 'owner') {
    return sendError(res, 'Only the business owner can change member roles', 403);
  }

  const target = await User.findById(userId);
  if (!target) return sendError(res, 'User not found', 404);

  // Prevent changing the owner's own role
  const targetEntry = target.businesses.find(b => b.business?.toString() === businessId);
  if (targetEntry?.role === 'owner') return sendError(res, 'Cannot change the owner role', 400);

  await User.updateOne(
    { _id: userId, 'businesses.business': businessId },
    { $set: { 'businesses.$.role': role } }
  );

  sendSuccess(res, { userId, newRole: role }, 'Role updated');
});

// DELETE /api/team/:userId
// Remove a member from a business
const removeMember = asyncHandler(async (req, res) => {
  const { userId }    = req.params;
  const { businessId } = req.query;

  // Only owners/admins can remove
  const requesterEntry = req.user.businesses.find(b => b.business?.toString() === businessId);
  if (!requesterEntry || !['owner','admin'].includes(requesterEntry.role)) {
    return sendError(res, 'Insufficient permissions', 403);
  }

  // Cannot remove owner
  const target = await User.findById(userId);
  if (!target) return sendError(res, 'User not found', 404);

  const targetEntry = target.businesses.find(b => b.business?.toString() === businessId);
  if (targetEntry?.role === 'owner') return sendError(res, 'Cannot remove the business owner', 400);

  await User.findByIdAndUpdate(userId, {
    $pull: { businesses: { business: businessId } },
  });

  // If this was their active business, clear it
  if (target.activeBusiness?.toString() === businessId) {
    const remaining = target.businesses.filter(b => b.business?.toString() !== businessId);
    await User.findByIdAndUpdate(userId, {
      activeBusiness: remaining[0]?.business || null,
    });
  }

  sendSuccess(res, null, 'Member removed from business');
});

// GET /api/team/my-businesses
// Returns all businesses the logged-in user belongs to (with their role)
const getMyBusinesses = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)
    .populate('businesses.business', 'name type gstin logo currency');

  const businesses = user.businesses.map(b => ({
    business: b.business,
    role:     b.role,
    isActive: user.activeBusiness?.toString() === b.business?._id?.toString(),
  }));

  sendSuccess(res, { businesses });
});

module.exports = { getMembers, inviteMember, updateMemberRole, removeMember, getMyBusinesses };
