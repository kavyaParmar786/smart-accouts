const express = require('express');
const router = express.Router();
const { getProfitLoss, getMonthlyTrend, getCategoryBreakdown, getDashboardStats, exportTransactions } = require('../controllers/report.controller');
const { protect } = require('../middleware/auth.middleware');

router.use(protect);
router.get('/dashboard', getDashboardStats);
router.get('/pl', getProfitLoss);
router.get('/monthly-trend', getMonthlyTrend);
router.get('/category-breakdown', getCategoryBreakdown);
router.get('/export', exportTransactions);

module.exports = router;
