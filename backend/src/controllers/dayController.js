/**
 * Day Completion Controller
 * Handles day completion tracking with timestamps
 */

const DayCompletion = require('../models/DayCompletion');
const Expense = require('../models/Expense');
const { toDateKey, parseDateSafely, getStartOfDay, getEndOfDay } = require('../utils/dateUtils');
const logger = require('../utils/logger');

/**
 * Mark day as complete
 */
exports.markDayComplete = async (req, res) => {
  try {
    const userId = req.user.id;
    const { date } = req.body;

    if (!date) {
      return res.status(400).json({
        success: false,
        message: 'Date is required',
      });
    }

    const parsedDate = parseDateSafely(date);
    const dateKey = toDateKey(parsedDate);

    let dayCompletion = await DayCompletion.findOne({
      userId,
      dateKey,
    });

    if (!dayCompletion) {
      dayCompletion = new DayCompletion({
        userId,
        dateKey,
        date: parsedDate,
      });
    }

    dayCompletion.isComplete = true;
    dayCompletion.completedAt = new Date();

    await dayCompletion.save();

    logger.info(`Day marked complete: ${dateKey} for user ${userId}`);

    res.status(200).json({
      success: true,
      data: dayCompletion,
      message: 'Day marked as complete',
    });
  } catch (error) {
    logger.error(`Error marking day complete: ${error.message}`);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Mark day as incomplete
 */
exports.markDayIncomplete = async (req, res) => {
  try {
    const userId = req.user.id;
    const { date } = req.body;

    if (!date) {
      return res.status(400).json({
        success: false,
        message: 'Date is required',
      });
    }

    const parsedDate = parseDateSafely(date);
    const dateKey = toDateKey(parsedDate);

    let dayCompletion = await DayCompletion.findOne({
      userId,
      dateKey,
    });

    if (!dayCompletion) {
      return res.status(404).json({
        success: false,
        message: 'Day record not found',
      });
    }

    dayCompletion.isComplete = false;
    dayCompletion.completedAt = null;

    await dayCompletion.save();

    logger.info(`Day marked incomplete: ${dateKey} for user ${userId}`);

    res.status(200).json({
      success: true,
      data: dayCompletion,
      message: 'Day marked as incomplete',
    });
  } catch (error) {
    logger.error(`Error marking day incomplete: ${error.message}`);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Get day status
 */
exports.getDayStatus = async (req, res) => {
  try {
    const userId = req.user.id;
    const { dateKey } = req.params;

    let dayCompletion = await DayCompletion.findOne({
      userId,
      dateKey,
    });

    // If not found, create it
    if (!dayCompletion) {
      // Parse the dateKey to get date
      const [year, month, day] = dateKey.split('-').map(Number);
      const date = new Date(year, month - 1, day);

      dayCompletion = await DayCompletion.findOrCreateDay(userId, dateKey, date);
    }

    res.status(200).json({
      success: true,
      data: dayCompletion,
    });
  } catch (error) {
    logger.error(`Error fetching day status: ${error.message}`);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Get incomplete days
 */
exports.getIncompleteDays = async (req, res) => {
  try {
    const userId = req.user.id;
    const { days = 7 } = req.query;

    const endDate = new Date();
    const startDate = new Date(endDate);
    startDate.setDate(startDate.getDate() - parseInt(days));
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(23, 59, 59, 999);

    const incompleteDays = await DayCompletion.getRecentIncompleteDays(userId, parseInt(days));

    res.status(200).json({
      success: true,
      data: incompleteDays,
      count: incompleteDays.length,
    });
  } catch (error) {
    logger.error(`Error fetching incomplete days: ${error.message}`);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Get all day completions for a date range
 */
exports.getDayCompletions = async (req, res) => {
  try {
    const userId = req.user.id;
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'startDate and endDate are required',
      });
    }

    const start = getStartOfDay(parseDateSafely(startDate));
    const end = getEndOfDay(parseDateSafely(endDate));

    const dayCompletions = await DayCompletion.find({
      userId,
      date: {
        $gte: start,
        $lte: end,
      },
    }).sort({ date: -1 });

    res.status(200).json({
      success: true,
      data: dayCompletions,
      count: dayCompletions.length,
    });
  } catch (error) {
    logger.error(`Error fetching day completions: ${error.message}`);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Initialize days for a date range (ensures records exist)
 */
exports.initializeDays = async (req, res) => {
  try {
    const userId = req.user.id;
    const { startDate, endDate } = req.body;

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'startDate and endDate are required',
      });
    }

    const start = getStartOfDay(parseDateSafely(startDate));
    const end = getEndOfDay(parseDateSafely(endDate));

    const daysToInitialize = [];
    const currentDate = new Date(start);

    while (currentDate <= end) {
      const dateKey = toDateKey(currentDate);
      const existing = await DayCompletion.findOne({ userId, dateKey });

      if (!existing) {
        daysToInitialize.push({
          userId,
          dateKey,
          date: new Date(currentDate),
          isComplete: false,
        });
      }

      currentDate.setDate(currentDate.getDate() + 1);
    }

    if (daysToInitialize.length > 0) {
      await DayCompletion.insertMany(daysToInitialize);
    }

    logger.info(`Initialized ${daysToInitialize.length} days for user ${userId}`);

    res.status(200).json({
      success: true,
      message: `Initialized ${daysToInitialize.length} days`,
      count: daysToInitialize.length,
    });
  } catch (error) {
    logger.error(`Error initializing days: ${error.message}`);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
