// Business Model - Each user can have multiple businesses
const mongoose = require('mongoose');

const businessSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Business name is required'],
    trim: true,
  },
  type: {
    type: String,
    required: true,
    enum: ['retail', 'wholesale', 'manufacturing', 'service', 'ecommerce', 'restaurant', 'other'],
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  gstin: { type: String, trim: true },
  pan: { type: String, trim: true },
  address: {
    street: String,
    city: String,
    state: String,
    pincode: String,
    country: { type: String, default: 'India' },
  },
  contact: {
    phone: String,
    email: String,
    website: String,
  },
  logo: String,
  currency: { type: String, default: 'INR' },
  financialYearStart: { type: String, default: 'April' },
  invoicePrefix: { type: String, default: 'INV' },
  invoiceCounter: { type: Number, default: 1 },
  settings: {
    defaultGstRate: { type: Number, default: 18 },
    enableInventory: { type: Boolean, default: true },
    enableInvoicing: { type: Boolean, default: true },
  },
  isActive: { type: Boolean, default: true },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Business', businessSchema);
