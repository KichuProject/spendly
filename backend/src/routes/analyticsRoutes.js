/**
 * Analytics Routes
 * Spending analytics and reports with timestamps
 */

const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middlewares/authMiddleware');
const {
  getCategoryBreakdown,
  getTopExpenses,
  getFriendBalance,
  getTotalBalance,
  getSpendingTrends,
} = require('../controllers/analyticsController');

router.use(authMiddleware);

/**
 * GET /api/analytics/breakdown
 * Get category breakdown with timestamps
 */
router.get('/breakdown', getCategoryBreakdown);

/**
 * GET /api/analytics/top-expenses
 * Get top expenses
 */
router.get('/top-expenses', getTopExpenses);

/**
 * GET /api/analytics/friend-balance/:friendId
 * Get friend balance
 */
router.get('/friend-balance/:friendId', getFriendBalance);

/**
 * GET /api/analytics/total-balance
 * Get total balance with all friends
 */
router.get('/total-balance', getTotalBalance);

/**
 * GET /api/analytics/trends
 * Get spending trends
 */
router.get('/trends', getSpendingTrends);

module.exports = router;
