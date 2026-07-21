/**
 * Analytics Controller
 * Spending analytics and reports with timestamps
 */

const Expense = require('../models/Expense');
const Friend = require('../models/Friend');
const { parseDateSafely, getStartOfDay, getEndOfDay } = require('../utils/dateUtils');
const logger = require('../utils/logger');

/**
 * Get category breakdown
 */
exports.getCategoryBreakdown = async (req, res) => {
  try {
    const userId = req.user.id;
    const { startDate, endDate, period = 'monthly' } = req.query;

    let filter = { userId, type: { $ne: 'income' } };

    if (startDate && endDate) {
      const start = getStartOfDay(parseDateSafely(startDate));
      const end = getEndOfDay(parseDateSafely(endDate));
      filter.date = { $gte: start, $lte: end };
    }

    const expenses = await Expense.find(filter).lean();

    // Group by category
    const breakdown = {};
    expenses.forEach((exp) => {
      const category = exp.category || 'Other';
      if (!breakdown[category]) {
        breakdown[category] = { total: 0, count: 0, emoji: exp.emoji };
      }
      breakdown[category].total += exp.amount;
      breakdown[category].count += 1;
    });

    // Convert to array and sort
    const result = Object.entries(breakdown)
      .map(([category, data]) => ({
        category,
        ...data,
        percentage: ((data.total / Object.values(breakdown).reduce((sum, v) => sum + v.total, 0)) * 100).toFixed(2),
      }))
      .sort((a, b) => b.total - a.total);

    res.status(200).json({
      success: true,
      data: result,
      total: Object.values(breakdown).reduce((sum, v) => sum + v.total, 0),
    });
  } catch (error) {
    logger.error(`Error getting category breakdown: ${error.message}`);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Get top expenses
 */
exports.getTopExpenses = async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit = 10 } = req.query;

    const topExpenses = await Expense.find({ userId, type: { $ne: 'income' } })
      .sort({ amount: -1 })
      .limit(parseInt(limit))
      .lean();

    res.status(200).json({
      success: true,
      data: topExpenses,
      count: topExpenses.length,
    });
  } catch (error) {
    logger.error(`Error getting top expenses: ${error.message}`);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Get friend balance
 */
exports.getFriendBalance = async (req, res) => {
  try {
    const userId = req.user.id;
    const { friendId } = req.params;

    const expenses = await Expense.find({
      userId,
      'splits.friendId': friendId,
    });

    let theyOweMe = 0;
    let iOweThem = 0;
    let settled = 0;
    let unsettled = 0;

    expenses.forEach((exp) => {
      if (!exp.splits) return;
      const split = exp.splits.find((s) => s.friendId.toString() === friendId);
      if (!split) return;

      if (split.direction === 'theyOwe') {
        if (split.paid) {
          settled += split.amount;
        } else {
          unsettled += split.amount;
          theyOweMe += split.amount;
        }
      } else if (split.direction === 'iOwe') {
        if (split.paid) {
          settled += split.amount;
        } else {
          unsettled += split.amount;
          iOweThem += split.amount;
        }
      }
    });

    res.status(200).json({
      success: true,
      data: {
        friendId,
        theyOweMe,
        iOweThem,
        settled,
        unsettled,
        net: theyOweMe - iOweThem,
      },
    });
  } catch (error) {
    logger.error(`Error getting friend balance: ${error.message}`);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Get total balance with all friends
 */
exports.getTotalBalance = async (req, res) => {
  try {
    const userId = req.user.id;

    const expenses = await Expense.find({ userId });

    let totalTheyOweMe = 0;
    let totalIOweThem = 0;
    let totalSettled = 0;
    let totalUnsettled = 0;
    const friendBalances = {};

    expenses.forEach((exp) => {
      if (!exp.splits) return;
      exp.splits.forEach((split) => {
        const friendId = split.friendId.toString();
        if (!friendBalances[friendId]) {
          friendBalances[friendId] = {
            theyOweMe: 0,
            iOweThem: 0,
            settled: 0,
            unsettled: 0,
          };
        }

        if (split.direction === 'theyOwe') {
          if (split.paid) {
            friendBalances[friendId].settled += split.amount;
            totalSettled += split.amount;
          } else {
            friendBalances[friendId].unsettled += split.amount;
            friendBalances[friendId].theyOweMe += split.amount;
            totalUnsettled += split.amount;
            totalTheyOweMe += split.amount;
          }
        } else if (split.direction === 'iOwe') {
          if (split.paid) {
            friendBalances[friendId].settled += split.amount;
            totalSettled += split.amount;
          } else {
            friendBalances[friendId].unsettled += split.amount;
            friendBalances[friendId].iOweThem += split.amount;
            totalUnsettled += split.amount;
            totalIOweThem += split.amount;
          }
        }
      });
    });

    res.status(200).json({
      success: true,
      data: {
        totalTheyOweMe,
        totalIOweThem,
        totalSettled,
        totalUnsettled,
        net: totalTheyOweMe - totalIOweThem,
        friendBalances,
      },
    });
  } catch (error) {
    logger.error(`Error getting total balance: ${error.message}`);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Get spending trends (daily/weekly/monthly)
 */
exports.getSpendingTrends = async (req, res) => {
  try {
    const userId = req.user.id;
    const { period = 'daily', days = 30 } = req.query;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));
    startDate.setHours(0, 0, 0, 0);

    const expenses = await Expense.find({
      userId,
      type: { $ne: 'income' },
      date: { $gte: startDate },
    }).lean();

    const trends = {};

    expenses.forEach((exp) => {
      let key;
      if (period === 'daily') {
        key = exp.dateKey;
      } else if (period === 'weekly') {
        const date = new Date(exp.date);
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        key = `W${weekStart.toISOString().split('T')[0]}`;
      } else if (period === 'monthly') {
        const date = new Date(exp.date);
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      }

      if (!trends[key]) {
        trends[key] = { total: 0, count: 0 };
      }
      trends[key].total += exp.amount;
      trends[key].count += 1;
    });

    const result = Object.entries(trends)
      .map(([period, data]) => ({
        period,
        ...data,
      }))
      .sort((a, b) => a.period.localeCompare(b.period));

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    logger.error(`Error getting spending trends: ${error.message}`);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Get Income Analytics (categories, accounts, sources, cash flow, net savings)
 */
exports.getIncomeAnalytics = async (req, res) => {
  try {
    const userId = req.user.id;
    const { startDate, endDate } = req.query;

    let filter = { userId };

    if (startDate && endDate) {
      const start = getStartOfDay(parseDateSafely(startDate));
      const end = getEndOfDay(parseDateSafely(endDate));
      filter.date = { $gte: start, $lte: end };
    }

    const allLogs = await Expense.find(filter).lean();

    const incomes = allLogs.filter(e => e.type === 'income');
    const expenses = allLogs.filter(e => e.type !== 'income');

    // 1. Income Category Breakdown
    const categoryBreakdown = {};
    incomes.forEach((inc) => {
      const cat = inc.category || 'Other';
      if (!categoryBreakdown[cat]) {
        categoryBreakdown[cat] = { total: 0, count: 0, emoji: inc.emoji };
      }
      categoryBreakdown[cat].total += inc.amount;
      categoryBreakdown[cat].count += 1;
    });

    const categoryArray = Object.entries(categoryBreakdown)
      .map(([category, data]) => ({
        category,
        ...data,
      }))
      .sort((a, b) => b.total - a.total);

    // 2. Account Distribution
    const accountBreakdown = {};
    incomes.forEach((inc) => {
      const acc = inc.account || 'Cash';
      if (!accountBreakdown[acc]) {
        accountBreakdown[acc] = { total: 0, count: 0 };
      }
      accountBreakdown[acc].total += inc.amount;
      accountBreakdown[acc].count += 1;
    });

    const accountArray = Object.entries(accountBreakdown)
      .map(([account, data]) => ({
        account,
        ...data,
      }));

    // 3. Source Distribution
    const sourceBreakdown = {};
    incomes.forEach((inc) => {
      const src = inc.source || 'Other';
      if (!sourceBreakdown[src]) {
        sourceBreakdown[src] = { total: 0, count: 0 };
      }
      sourceBreakdown[src].total += inc.amount;
      sourceBreakdown[src].count += 1;
    });

    const sourceArray = Object.entries(sourceBreakdown)
      .map(([source, data]) => ({
        source,
        ...data,
      }))
      .sort((a, b) => b.total - a.total);

    // 4. Net Savings & Cash Flow
    const totalIncome = incomes.reduce((sum, e) => sum + e.amount, 0);
    const totalExpense = expenses.reduce((sum, e) => sum + e.amount, 0);

    // 5. Cash Flow Trends
    const cashFlowTrends = {};
    allLogs.forEach((item) => {
      const key = item.dateKey;
      if (!cashFlowTrends[key]) {
        cashFlowTrends[key] = { income: 0, expense: 0 };
      }
      if (item.type === 'income') {
        cashFlowTrends[key].income += item.amount;
      } else {
        cashFlowTrends[key].expense += item.amount;
      }
    });

    const trendArray = Object.entries(cashFlowTrends)
      .map(([dateKey, data]) => ({
        dateKey,
        ...data,
        net: data.income - data.expense,
      }))
      .sort((a, b) => a.dateKey.localeCompare(b.dateKey));

    res.status(200).json({
      success: true,
      data: {
        totalIncome,
        totalExpense,
        netSavings: totalIncome - totalExpense,
        categories: categoryArray,
        accounts: accountArray,
        sources: sourceArray,
        cashFlowTrends: trendArray,
      },
    });
  } catch (error) {
    logger.error(`Error getting income analytics: ${error.message}`);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
