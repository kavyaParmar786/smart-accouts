// Product / Inventory Model
const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
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
  name: { type: String, required: true, trim: true },
  sku: { type: String, trim: true },
  category: String,
  description: String,
  
  // Pricing
  price: { type: Number, default: 0 },      // selling price
  costPrice: { type: Number, default: 0 },  // purchase/cost price
  gstRate: { type: Number, default: 18 },
  
  // Stock
  quantity: { type: Number, default: 0 },
  lowStockThreshold: { type: Number, default: 10 },
  unit: { type: String, default: 'pcs' },
  
  // Stock movement history
  stockHistory: [{
    type: { type: String, enum: ['in', 'out', 'adjustment'] },
    quantity: Number,
    reason: String,
    date: { type: Date, default: Date.now },
    reference: String,
  }],
  
  isActive: { type: Boolean, default: true },
  imageUrl: String,
}, {
  timestamps: true,
});

// Virtual for low stock status
productSchema.virtual('isLowStock').get(function() {
  return this.quantity <= this.lowStockThreshold;
});

// Virtual for profit margin
productSchema.virtual('profitMargin').get(function() {
  if (this.costPrice === 0) return 100;
  return (((this.price - this.costPrice) / this.price) * 100).toFixed(2);
});

productSchema.set('toJSON', { virtuals: true });
productSchema.index({ business: 1, name: 1 });

module.exports = mongoose.model('Product', productSchema);
