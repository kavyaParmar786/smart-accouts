// Placeholder — invites are handled inline in team.controller
// Extend this for email-based invite tokens in production
const mongoose = require('mongoose');
const inviteSchema = new mongoose.Schema({
  business: { type: mongoose.Schema.Types.ObjectId, ref: 'Business', required: true },
  email: { type: String, required: true, lowercase: true },
  role: { type: String, enum: ['admin','staff'], default: 'staff' },
  token: { type: String, required: true },
  invitedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  expiresAt: { type: Date, default: () => new Date(Date.now() + 7*24*60*60*1000) },
  accepted: { type: Boolean, default: false },
}, { timestamps: true });
module.exports = mongoose.model('Invite', inviteSchema);
