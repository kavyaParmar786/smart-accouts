// Request validation middleware using Joi
const Joi = require('joi');

const validate = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body, { abortEarly: false });
  if (error) {
    const errors = error.details.map(d => d.message.replace(/['"]/g, ''));
    return res.status(400).json({ success: false, message: 'Validation failed', errors });
  }
  next();
};

// Auth schemas
const schemas = {
  register: Joi.object({
    name: Joi.string().min(2).max(50).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    role: Joi.string().valid('admin', 'staff').default('admin'),
  }),

  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  }),

  business: Joi.object({
    name: Joi.string().min(2).max(100).required(),
    type: Joi.string().required(),
    gstin: Joi.string().allow('').optional(),
    address: Joi.object({
      street: Joi.string().allow('').optional(),
      city: Joi.string().allow('').optional(),
      state: Joi.string().allow('').optional(),
      pincode: Joi.string().allow('').optional(),
    }).optional(),
    currency: Joi.string().default('INR'),
    financialYearStart: Joi.string().allow('').optional(),
  }),

  transaction: Joi.object({
    businessId: Joi.string().required(),
    type: Joi.string().valid('income', 'expense').required(),
    amount: Joi.number().positive().required(),
    category: Joi.string().required(),
    description: Joi.string().allow('').optional(),
    date: Joi.date().default(Date.now),
    paymentMethod: Joi.string().valid('cash', 'bank', 'upi', 'card', 'other').default('cash'),
    reference: Joi.string().allow('').optional(),
    tags: Joi.array().items(Joi.string()).optional(),
  }),

  invoice: Joi.object({
    businessId: Joi.string().required(),
    customer: Joi.object({
      name: Joi.string().required(),
      email: Joi.string().email().allow('').optional(),
      phone: Joi.string().allow('').optional(),
      address: Joi.string().allow('').optional(),
      gstin: Joi.string().allow('').optional(),
    }).required(),
    items: Joi.array().items(
      Joi.object({
        name: Joi.string().required(),
        description: Joi.string().allow('').optional(),
        quantity: Joi.number().positive().required(),
        rate: Joi.number().positive().required(),
        gstRate: Joi.number().min(0).max(100).default(18),
      })
    ).min(1).required(),
    dueDate: Joi.date().optional(),
    notes: Joi.string().allow('').optional(),
    discount: Joi.number().min(0).default(0),
  }),

  product: Joi.object({
    businessId: Joi.string().required(),
    name: Joi.string().required(),
    sku: Joi.string().allow('').optional(),
    category: Joi.string().allow('').optional(),
    description: Joi.string().allow('').optional(),
    price: Joi.number().min(0).default(0),
    costPrice: Joi.number().min(0).default(0),
    quantity: Joi.number().min(0).default(0),
    lowStockThreshold: Joi.number().min(0).default(10),
    unit: Joi.string().default('pcs'),
    gstRate: Joi.number().min(0).max(100).default(18),
  }),
};

module.exports = { validate, schemas };
