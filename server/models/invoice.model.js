// Invoice Model
const mongoose = require('mongoose');

const invoiceItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  quantity: { type: Number, required: true, min: 0 },
  rate: { type: Number, required: true, min: 0 },
  gstRate: { type: Number, default: 18 },
  amount: Number,     // quantity * rate
  gstAmount: Number,  // calculated
  total: Number,      // amount + gstAmount
});

const invoiceSchema = new mongoose.Schema({
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
  invoiceNumber: { type: String, required: true },
  customer: {
    name: { type: String, required: true },
    email: String,
    phone: String,
    address: String,
    gstin: String,
  },
  items: [invoiceItemSchema],
  
  // Calculated totals
  subtotal: { type: Number, default: 0 },
  totalGst: { type: Number, default: 0 },
  discount: { type: Number, default: 0 },
  grandTotal: { type: Number, default: 0 },
  
  status: {
    type: String,
    enum: ['draft', 'sent', 'paid', 'overdue', 'cancelled'],
    default: 'draft',
    index: true,
  },
  
  issueDate: { type: Date, default: Date.now },
  dueDate: Date,
  paidDate: Date,
  
  notes: String,
  terms: String,
  
  // Payment tracking
  amountPaid: { type: Number, default: 0 },
  paymentHistory: [{
    amount: Number,
    date: Date,
    method: String,
    note: String,
  }],
}, {
  timestamps: true,
});

// Auto-calculate totals before save
invoiceSchema.pre('save', function(next) {
  let subtotal = 0;
  let totalGst = 0;

  this.items.forEach(item => {
    item.amount = item.quantity * item.rate;
    item.gstAmount = (item.amount * item.gstRate) / 100;
    item.total = item.amount + item.gstAmount;
    subtotal += item.amount;
    totalGst += item.gstAmount;
  });

  this.subtotal = subtotal;
  this.totalGst = totalGst;
  this.grandTotal = subtotal + totalGst - (this.discount || 0);
  next();
});

invoiceSchema.index({ business: 1, status: 1 });
invoiceSchema.index({ business: 1, issueDate: -1 });

module.exports = mongoose.model('Invoice', invoiceSchema);
