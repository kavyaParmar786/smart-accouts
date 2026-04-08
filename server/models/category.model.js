// Category Model - Custom transaction categories
const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  business: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Business',
    required: true,
  },
  name: { type: String, required: true, trim: true },
  type: { type: String, enum: ['income', 'expense', 'both'], required: true },
  color: { type: String, default: '#6366f1' },
  icon: { type: String, default: '📦' },
  isDefault: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
}, {
  timestamps: true,
});

categorySchema.index({ business: 1, type: 1 });

module.exports = mongoose.model('Category', categorySchema);
