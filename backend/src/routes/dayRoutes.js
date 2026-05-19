/**
 * Day Routes
 * Day completion tracking with timestamps
 */

const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middlewares/authMiddleware');
const {
  markDayComplete,
  markDayIncomplete,
  getDayStatus,
  getIncompleteDays,
  getDayCompletions,
  initializeDays,
} = require('../controllers/dayController');

router.use(authMiddleware);

/**
 * POST /api/days/mark-complete
 * Mark day as complete with timestamps
 */
router.post('/mark-complete', markDayComplete);

/**
 * POST /api/days/unmark-complete
 * Mark day as incomplete
 */
router.post('/unmark-complete', markDayIncomplete);

/**
 * GET /api/days/status/:dateKey
 * Get day status
 */
router.get('/status/:dateKey', getDayStatus);

/**
 * GET /api/days/incomplete
 * Get incomplete days
 */
router.get('/incomplete', getIncompleteDays);

/**
 * GET /api/days/completions
 * Get all day completions for date range
 */
router.get('/completions', getDayCompletions);

/**
 * POST /api/days/initialize
 * Initialize days for a date range
 */
router.post('/initialize', initializeDays);

module.exports = router;
