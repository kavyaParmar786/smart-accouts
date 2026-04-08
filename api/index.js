// Vercel Serverless Entry Point
// This file wraps the Express app for Vercel's serverless environment

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const connectDB = require('../server/utils/db');
const authRoutes = require('../server/routes/auth.routes');
const businessRoutes = require('../server/routes/business.routes');
const transactionRoutes = require('../server/routes/transaction.routes');
const invoiceRoutes = require('../server/routes/invoice.routes');
const inventoryRoutes = require('../server/routes/inventory.routes');
const reportRoutes = require('../server/routes/report.routes');
const categoryRoutes = require('../server/routes/category.routes');
const { errorHandler } = require('../server/middleware/error.middleware');

const app = express();

// Connect to MongoDB (cached for serverless - won't reconnect on every request)
connectDB();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || '*',
  credentials: true,
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: { error: 'Too many requests, please try again later.' }
});
app.use('/api/', limiter);

// Body parsing & logging
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
if (process.env.NODE_ENV === 'development') app.use(morgan('dev'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date(), version: '1.0.0' });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/businesses', businessRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/categories', categoryRoutes);

// Global error handler
app.use(errorHandler);

// Export for Vercel (do NOT call app.listen)
module.exports = app;
