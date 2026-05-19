/**
 * Expense Routes
 * CRUD operations for expenses with timestamps
 */

const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middlewares/authMiddleware');
const {
  createExpense,
  getExpenses,
  getExpense,
  updateExpense,
  deleteExpense,
  getExpensesByDate,
  getWeekExpenses,
  getMonthExpenses,
  getTodayExpenses,
  updateSplitSettlement,
  settleAllWithFriend,
} = require('../controllers/expenseController');

// All expense routes require authentication
router.use(authMiddleware);

/**
 * POST /api/expenses
 * Create expense with timestamps
 */
router.post('/', createExpense);

/**
 * GET /api/expenses
 * Get all expenses with filters
 */
router.get('/', getExpenses);

/**
 * GET /api/expenses/today
 * Get today's expenses
 */
router.get('/today', getTodayExpenses);

/**
 * GET /api/expenses/week
 * Get week expenses
 */
router.get('/week', getWeekExpenses);

/**
 * GET /api/expenses/month
 * Get month expenses
 */
router.get('/month', getMonthExpenses);

/**
 * GET /api/expenses/date/:dateKey
 * Get expenses by date
 */
router.get('/date/:dateKey', getExpensesByDate);

/**
 * GET /api/expenses/:id
 * Get single expense
 */
router.get('/:id', getExpense);

/**
 * PUT /api/expenses/:id
 * Update expense with timestamps
 */
router.put('/:id', updateExpense);

/**
 * DELETE /api/expenses/:id
 * Delete expense
 */
router.delete('/:id', deleteExpense);

/**
 * PUT /api/expenses/:expenseId/split/:friendId
 * Update split settlement
 */
router.put('/:expenseId/split/:friendId', updateSplitSettlement);

/**
 * POST /api/expenses/settle/:friendId
 * Settle all with friend
 */
router.post('/settle/:friendId', settleAllWithFriend);

module.exports = router;
