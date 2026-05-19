/**
 * Expense Controller
 * Handles all expense-related operations
 */

const Expense = require('../models/Expense');
const DayCompletion = require('../models/DayCompletion');
const { toDateKey, getStartOfDay, getEndOfDay, parseDateSafely } = require('../utils/dateUtils');
const logger = require('../utils/logger');

/**
 * Create expense
 */
exports.createExpense = async (req, res) => {
  try {
    const { amount, reason, category, emoji, date, type, splits, notes, tags, paymentMethod } = req.body;
    const userId = req.user.id;

    // Validation
    if (!amount || !reason || !date) {
      return res.status(400).json({
        success: false,
        message: 'Amount, reason, and date are required',
      });
    }

    // Parse date and create dateKey
    const expenseDate = parseDateSafely(date);
    const dateKey = toDateKey(expenseDate);

    // Calculate split amounts if type is split
    let processedSplits = [];
    if ((type === 'split' || type === 'friend') && splits && splits.length > 0) {
      processedSplits = splits.map((split) => ({
        friendId: split.friendId,
        friendName: split.friendName,
        amount: split.amount,
        direction: split.direction, // 'theyOwe' or 'iOwe'
        paid: split.paid || false,
      }));
    }

    // Create expense with timestamps
    const expense = new Expense({
      userId,
      amount,
      reason,
      category: category || 'Other',
      emoji: emoji || '💰',
      date: expenseDate,
      dateKey,
      type: type || 'solo',
      splits: processedSplits,
      notes: notes || null,
      tags: tags || [],
      paymentMethod: paymentMethod || 'cash',
    });

    await expense.save();

    // Ensure day completion record exists
    await DayCompletion.findOrCreateDay(userId, dateKey, expenseDate);

    logger.info(`Expense created: ${expense._id} for user ${userId}`);

    res.status(201).json({
      success: true,
      data: expense,
      message: 'Expense created successfully',
    });
  } catch (error) {
    logger.error(`Error creating expense: ${error.message}`);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Get all expenses with filters
 */
exports.getExpenses = async (req, res) => {
  try {
    const userId = req.user.id;
    const { startDate, endDate, category, type } = req.query;

    const filter = { userId };

    // Date range filter
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) {
        filter.date.$gte = getStartOfDay(parseDateSafely(startDate));
      }
      if (endDate) {
        filter.date.$lte = getEndOfDay(parseDateSafely(endDate));
      }
    }

    // Category filter
    if (category) {
      filter.category = category;
    }

    // Type filter
    if (type) {
      filter.type = type;
    }

    const expenses = await Expense.find(filter)
      .sort({ date: -1, createdAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      data: expenses,
      count: expenses.length,
    });
  } catch (error) {
    logger.error(`Error fetching expenses: ${error.message}`);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Get single expense
 */
exports.getExpense = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const expense = await Expense.findOne({
      _id: id,
      userId,
    });

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: 'Expense not found',
      });
    }

    res.status(200).json({
      success: true,
      data: expense,
    });
  } catch (error) {
    logger.error(`Error fetching expense: ${error.message}`);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Update expense
 */
exports.updateExpense = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { amount, reason, category, emoji, date, type, splits, notes, tags, paymentMethod } = req.body;

    const expense = await Expense.findOne({
      _id: id,
      userId,
    });

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: 'Expense not found',
      });
    }

    // Update fields
    if (amount !== undefined) expense.amount = amount;
    if (reason !== undefined) expense.reason = reason;
    if (category !== undefined) expense.category = category;
    if (emoji !== undefined) expense.emoji = emoji;
    if (date !== undefined) {
      expense.date = parseDateSafely(date);
      expense.dateKey = toDateKey(expense.date);
    }
    if (type !== undefined) expense.type = type;
    if (splits !== undefined) {
      expense.splits = splits.map((split) => ({
        friendId: split.friendId,
        friendName: split.friendName,
        amount: split.amount,
        direction: split.direction,
        paid: split.paid || false,
      }));
    }
    if (notes !== undefined) expense.notes = notes;
    if (tags !== undefined) expense.tags = tags;
    if (paymentMethod !== undefined) expense.paymentMethod = paymentMethod;

    await expense.save();

    logger.info(`Expense updated: ${id}`);

    res.status(200).json({
      success: true,
      data: expense,
      message: 'Expense updated successfully',
    });
  } catch (error) {
    logger.error(`Error updating expense: ${error.message}`);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Delete expense
 */
exports.deleteExpense = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const expense = await Expense.findOneAndDelete({
      _id: id,
      userId,
    });

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: 'Expense not found',
      });
    }

    logger.info(`Expense deleted: ${id}`);

    res.status(200).json({
      success: true,
      message: 'Expense deleted successfully',
    });
  } catch (error) {
    logger.error(`Error deleting expense: ${error.message}`);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Get expenses by date
 */
exports.getExpensesByDate = async (req, res) => {
  try {
    const userId = req.user.id;
    const { dateKey } = req.params;

    const expenses = await Expense.find({
      userId,
      dateKey,
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: expenses,
      count: expenses.length,
    });
  } catch (error) {
    logger.error(`Error fetching expenses by date: ${error.message}`);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Get expenses for current week
 */
exports.getWeekExpenses = async (req, res) => {
  try {
    const userId = req.user.id;
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const expenses = await Expense.find({
      userId,
      date: {
        $gte: startOfWeek,
        $lte: now,
      },
    }).sort({ date: -1 });

    res.status(200).json({
      success: true,
      data: expenses,
      count: expenses.length,
    });
  } catch (error) {
    logger.error(`Error fetching week expenses: ${error.message}`);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Get expenses for current month
 */
exports.getMonthExpenses = async (req, res) => {
  try {
    const userId = req.user.id;
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    startOfMonth.setHours(0, 0, 0, 0);

    const expenses = await Expense.find({
      userId,
      date: {
        $gte: startOfMonth,
        $lte: now,
      },
    }).sort({ date: -1 });

    res.status(200).json({
      success: true,
      data: expenses,
      count: expenses.length,
    });
  } catch (error) {
    logger.error(`Error fetching month expenses: ${error.message}`);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Get today's expenses
 */
exports.getTodayExpenses = async (req, res) => {
  try {
    const userId = req.user.id;
    const today = getStartOfDay(new Date());
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const expenses = await Expense.find({
      userId,
      date: {
        $gte: today,
        $lt: tomorrow,
      },
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: expenses,
      count: expenses.length,
    });
  } catch (error) {
    logger.error(`Error fetching today expenses: ${error.message}`);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Update split settlement
 */
exports.updateSplitSettlement = async (req, res) => {
  try {
    const userId = req.user.id;
    const { expenseId, friendId } = req.params;
    const { paid } = req.body;

    const expense = await Expense.findOne({
      _id: expenseId,
      userId,
    });

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: 'Expense not found',
      });
    }

    // Update the split status
    const split = expense.splits.find((s) => s.friendId.toString() === friendId);
    if (split) {
      split.paid = paid || !split.paid;
    }

    await expense.save();

    logger.info(`Split settlement updated for expense ${expenseId}, friend ${friendId}`);

    res.status(200).json({
      success: true,
      data: expense,
      message: 'Split settlement updated',
    });
  } catch (error) {
    logger.error(`Error updating split settlement: ${error.message}`);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Settle all with a friend
 */
exports.settleAllWithFriend = async (req, res) => {
  try {
    const userId = req.user.id;
    const { friendId } = req.params;

    const expenses = await Expense.find({
      userId,
      'splits.friendId': friendId,
    });

    for (const expense of expenses) {
      expense.splits = expense.splits.map((split) => {
        if (split.friendId.toString() === friendId) {
          split.paid = true;
        }
        return split;
      });
      await expense.save();
    }

    logger.info(`All expenses settled with friend ${friendId} for user ${userId}`);

    res.status(200).json({
      success: true,
      message: 'All expenses settled with friend',
    });
  } catch (error) {
    logger.error(`Error settling with friend: ${error.message}`);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
