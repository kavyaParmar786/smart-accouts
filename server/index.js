// SmartAccounts - Main Server Entry Point
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const connectDB = require('./utils/db');
const authRoutes = require('./routes/auth.routes');
const businessRoutes = require('./routes/business.routes');
const transactionRoutes = require('./routes/transaction.routes');
const invoiceRoutes = require('./routes/invoice.routes');
const inventoryRoutes = require('./routes/inventory.routes');
const reportRoutes = require('./routes/report.routes');
const categoryRoutes = require('./routes/category.routes');
const { errorHandler } = require('./middleware/error.middleware');

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
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

app.listen(PORT, () => {
  console.log(`🚀 SmartAccounts server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV}`);
});

module.exports = app;
