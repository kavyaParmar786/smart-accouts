// Transaction Model - Income & Expenses
const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  business: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Business',
    required: true,
    index: true,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  type: {
    type: String,
    enum: ['income', 'expense'],
    required: true,
    index: true,
  },
  amount: {
    type: Number,
    required: true,
    min: [0, 'Amount must be positive'],
  },
  category: {
    type: String,
    required: true,
  },
  description: { type: String, trim: true },
  date: {
    type: Date,
    default: Date.now,
    index: true,
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'bank', 'upi', 'card', 'other'],
    default: 'cash',
  },
  reference: String, // invoice number, cheque number, etc.
  tags: [String],
  // Link to invoice if transaction came from one
  invoice: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Invoice',
  },
  isRecurring: { type: Boolean, default: false },
  recurringInterval: String, // monthly, weekly, etc.
}, {
  timestamps: true,
});

// Compound indexes for efficient queries
transactionSchema.index({ business: 1, date: -1 });
transactionSchema.index({ business: 1, type: 1, date: -1 });
transactionSchema.index({ business: 1, category: 1 });

module.exports = mongoose.model('Transaction', transactionSchema);
