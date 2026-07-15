/**
 * Voice Service
 * Handles business logic for voice transactions, including saving to database.
 */

const Expense = require('../models/Expense');
const DayCompletion = require('../models/DayCompletion');
const { getStartOfDay, addDays, toDateKey, parseDateSafely } = require('../utils/dateUtils');
const logger = require('../utils/logger');

/**
 * Parses date string (e.g., 'today', 'yesterday', 'YYYY-MM-DD') into Date object
 */
const resolveTransactionDate = (dateStr) => {
  let finalDate = new Date(); // Default to today
  if (dateStr) {
    const lowerDate = dateStr.toString().toLowerCase();
    if (lowerDate === 'today') {
      finalDate = getStartOfDay(new Date());
    } else if (lowerDate === 'yesterday') {
      finalDate = getStartOfDay(addDays(new Date(), -1));
    } else {
      const parsedMs = Date.parse(lowerDate);
      if (!isNaN(parsedMs)) {
        finalDate = new Date(parsedMs);
      }
    }
  }
  return finalDate;
};

/**
 * Save transactions to database using bulk insert
 */
const saveTransactions = async (transactions, userId) => {
  // Map transactions to Expense schema format
  const processedExpenses = [];
  const dateKeysToUpdate = new Map();

  for (const tx of transactions) {
    const { type, amount, category, description, date } = tx;
    
    const expenseDate = resolveTransactionDate(date);
    const dateKey = toDateKey(expenseDate);
    dateKeysToUpdate.set(dateKey, expenseDate);

    processedExpenses.push({
      userId,
      amount: Number(amount),
      reason: description,
      category: category || 'Other',
      emoji: '💰', // default
      date: expenseDate,
      dateKey,
      type: 'solo', // Voice transactions are assumed 'solo' initially
      splits: [],
      notes: null,
      tags: [],
      paymentMethod: 'cash',
    });
  }

  // Insert all in a single bulk operation
  const savedExpenses = await Expense.insertMany(processedExpenses);

  // Update DayCompletion for analytics/streaks
  for (const [dateKey, date] of dateKeysToUpdate.entries()) {
    await DayCompletion.findOrCreateDay(userId, dateKey, date);
  }

  logger.info(`Voice Service: Bulk saved ${savedExpenses.length} transactions for user ${userId}`);

  return savedExpenses;
};

module.exports = {
  saveTransactions,
  resolveTransactionDate,
};
