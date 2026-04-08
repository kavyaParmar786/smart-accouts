// User Model
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: 50,
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 6,
    select: false,
  },
  role: {
    type: String,
    enum: ['admin', 'staff'],
    default: 'admin',
  },
  avatar: String,
  // Businesses this user belongs to
  businesses: [{
    business: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Business',
    },
    role: {
      type: String,
      enum: ['owner', 'admin', 'staff'],
      default: 'owner',
    },
  }],
  // Currently active business
  activeBusiness: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Business',
  },
  isActive: { type: Boolean, default: true },
  lastLogin: Date,
}, {
  timestamps: true,
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare entered password with hashed
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
