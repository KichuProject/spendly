/**
 * Voice Controller
 * Handles conversational parsing and confirming of voice transactions
 */

const { chatWithNvidia } = require('../utils/nvidiaAi');
const { getStartOfDay, getEndOfDay, getStartOfWeek, getStartOfMonth, addDays, toDateKey } = require('../utils/dateUtils');
const { validateTransactions } = require('../utils/voiceValidation');
const conversationManager = require('../utils/conversationManager');
const voiceService = require('../services/voiceService');
const logger = require('../utils/logger');
const Expense = require('../models/Expense');
const Friend = require('../models/Friend');
const mongoose = require('mongoose');

exports.chatTransaction = async (req, res) => {
  try {
    const { message, conversationId } = req.body;
    const userId = req.user.id;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Message is required in the request body.',
      });
    }

    // Get or create conversation context
    const conv = conversationManager.getOrCreateConversation(userId, conversationId);

    // Append user message
    conversationManager.addMessage(conv.conversationId, userId, 'user', message);

    // Fetch user's recent transactions using the correct userId field key
    logger.info(`[DEBUG_VOICE] Querying expenses for userId: "${userId}"`);
    const queryUserId = mongoose.Types.ObjectId.isValid(userId) ? new mongoose.Types.ObjectId(userId) : userId;
    let expenses = await Expense.find({ userId: queryUserId }).sort({ date: -1 }).limit(500);
    logger.info(`[DEBUG_VOICE] Found ${expenses.length} expenses in DB for queryUserId: ${queryUserId}`);
    
    // Fallback: If no expenses found for this user, fetch all expenses in the DB (allow all get req from db)
    if (expenses.length === 0) {
      logger.info(`[DEBUG_VOICE] Fallback: Querying all expenses in DB without userId filter.`);
      expenses = await Expense.find({}).sort({ date: -1 }).limit(500);
      logger.info(`[DEBUG_VOICE] Fallback query returned ${expenses.length} expenses.`);
    }

    // Calculate dynamic totals and category breakdowns programmatically for 100% correct math
    const calculateTotals = (expensesList) => {
      const now = new Date();
      const startOfToday = getStartOfDay(now);
      const endOfToday = getEndOfDay(now);
      const startOfWeek = getStartOfWeek(now);
      const startOfMonth = getStartOfMonth(now);

      let todaySum = 0;
      let weekSum = 0;
      let monthSum = 0;
      let totalSum = 0;

      let todayIncomeSum = 0;
      let weekIncomeSum = 0;
      let monthIncomeSum = 0;
      let totalIncomeSum = 0;

      expensesList.forEach(e => {
        const expenseDate = new Date(e.date);
        const amount = Number(e.amount) || 0;
        const isInc = e.type === 'income';

        if (isInc) {
          if (expenseDate >= startOfToday && expenseDate <= endOfToday) {
            todayIncomeSum += amount;
          }
          if (expenseDate >= startOfWeek) {
            weekIncomeSum += amount;
          }
          if (expenseDate >= startOfMonth) {
            monthIncomeSum += amount;
          }
          totalIncomeSum += amount;
        } else {
          if (expenseDate >= startOfToday && expenseDate <= endOfToday) {
            todaySum += amount;
          }
          if (expenseDate >= startOfWeek) {
            weekSum += amount;
          }
          if (expenseDate >= startOfMonth) {
            monthSum += amount;
          }
          totalSum += amount;
        }
      });

      return {
        todaySum,
        weekSum,
        monthSum,
        totalSum,
        todayIncomeSum,
        weekIncomeSum,
        monthIncomeSum,
        totalIncomeSum,
        netToday: todayIncomeSum - todaySum,
        netWeek: weekIncomeSum - weekSum,
        netMonth: monthIncomeSum - monthSum,
        netTotal: totalIncomeSum - totalSum,
      };
    };

    const totals = calculateTotals(expenses);
    
    const categoryBreakdown = {};
    const incomeCategoryBreakdown = {};
    expenses.forEach(e => {
      const cat = e.category || 'Other';
      const amount = Number(e.amount) || 0;
      if (e.type === 'income') {
        incomeCategoryBreakdown[cat] = (incomeCategoryBreakdown[cat] || 0) + amount;
      } else {
        categoryBreakdown[cat] = (categoryBreakdown[cat] || 0) + amount;
      }
    });

    const expenseContext = expenses.map(e => ({
      description: e.reason,
      amount: e.amount,
      category: e.category,
      type: e.type,
      date: e.date instanceof Date ? e.date.toISOString().split('T')[0] : String(e.date).split('T')[0]
    }));

    // Call AI with full history and database context (expenses, totals, breakdowns)
    const parsedResult = await chatWithNvidia(conv.messages, {
      expenses: expenseContext,
      totals,
      categoryBreakdown,
      incomeCategoryBreakdown
    });

    if (!parsedResult) {
      return res.status(400).json({
        success: false,
        message: 'Unable to understand the voice transaction.',
      });
    }

    // Determine the actual JSON payload and text
    let jsonPayload = parsedResult;
    let rawText = '';
    
    if (parsedResult.parsedJson) {
      jsonPayload = parsedResult.parsedJson;
      rawText = parsedResult.rawText || '';
    }

    // Append assistant response to history
    conversationManager.addMessage(conv.conversationId, userId, 'assistant', rawText || JSON.stringify(jsonPayload));

    // Handle plain text response / questions
    if (typeof parsedResult === 'string' || (jsonPayload.confirmationRequired === false && jsonPayload.reply)) {
      let finalReply = typeof parsedResult === 'string' ? parsedResult : jsonPayload.reply;
      
      // Determine if the user explicitly wants cards/visual list layout
      const userQuery = message.toLowerCase();
      const wantsCards = userQuery.includes('show card') || 
                         userQuery.includes('render card') || 
                         userQuery.includes('view card') ||
                         userQuery.includes('filter card') ||
                         userQuery.includes('in card') ||
                         userQuery.includes('with card');

      if (jsonPayload.filters && wantsCards) {
        finalReply += ` [FILTER: ${JSON.stringify(jsonPayload.filters)}]`;
      }
      return res.status(200).json({
        success: true,
        conversationId: conv.conversationId,
        confirmationRequired: false,
        reply: finalReply,
      });
    }

    // Extract transaction details
    let transactionsArray = [];
    if (jsonPayload.transactions && Array.isArray(jsonPayload.transactions)) {
      transactionsArray = jsonPayload.transactions;
    } else if (jsonPayload.transaction) {
      transactionsArray = [jsonPayload.transaction];
    }

    if (transactionsArray.length === 0) {
      return res.status(200).json({
        success: true,
        conversationId: conv.conversationId,
        confirmationRequired: false,
        reply: rawText || 'Unable to parse transaction.',
      });
    }

    // Validate
    const validationResult = validateTransactions(transactionsArray);
    
    if (!validationResult.isValid) {
      return res.status(400).json({
        success: false,
        message: 'One or more transactions have missing information.',
        errors: validationResult.errors,
      });
    }

    // Process all transactions to standardize dates format for frontend
    const processedTransactions = [];
    for (const tx of transactionsArray) {
      let finalDate = new Date();
      if (tx.date) {
        const lowerDate = tx.date.toString().toLowerCase();
        if (lowerDate === 'today') {
          finalDate = new Date();
        } else if (lowerDate === 'yesterday') {
          finalDate = addDays(new Date(), -1);
        } else {
          const parsedMs = Date.parse(lowerDate);
          if (!isNaN(parsedMs)) {
            finalDate = new Date(parsedMs);
          }
        }
      }

      processedTransactions.push({
        type: tx.type.toLowerCase() === 'expense' ? 'expense' : 'income',
        amount: Number(tx.amount),
        category: tx.category,
        reason: tx.description || '', 
        description: tx.description || '',
        emoji: tx.emoji || '💰',
        date: finalDate.toISOString(),
      });
    }

    // Store pending transactions in conversation context
    conversationManager.updateConversation(conv.conversationId, userId, { pendingTransactions: processedTransactions });

    res.status(200).json({
      success: true,
      conversationId: conv.conversationId,
      confirmationRequired: true,
      transactions: processedTransactions,
    });

  } catch (error) {
    logger.error(`Error in chatTransaction: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'An error occurred while parsing the voice transaction.',
    });
  }
};

exports.confirmTransactions = async (req, res) => {
  try {
    const { conversationId } = req.body;
    const userId = req.user.id;

    if (!conversationId) {
      return res.status(400).json({
        success: false,
        message: 'conversationId is required',
      });
    }

    const conv = conversationManager.getConversation(conversationId, userId);
    if (!conv || !conv.pendingTransactions || conv.pendingTransactions.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No pending transactions found for this conversation.',
      });
    }

    const transactions = req.body.transactions || conv.pendingTransactions;

    // Save using the dedicated voice service
    const savedTransactions = await voiceService.saveTransactions(transactions, userId);

    // Delete conversation context
    conversationManager.deleteConversation(conversationId, userId);

    res.status(201).json({
      success: true,
      message: 'Expense added successfully.',
      transactions: savedTransactions,
    });
  } catch (error) {
    logger.error(`Error confirming voice transactions: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'An error occurred while confirming the transactions.',
    });
  }
};

exports.cancelConversation = async (req, res) => {
  try {
    const { conversationId } = req.body;
    const userId = req.user.id;

    if (!conversationId) {
      return res.status(400).json({
        success: false,
        message: 'conversationId is required',
      });
    }

    conversationManager.deleteConversation(conversationId, userId);

    res.status(200).json({
      success: true,
      message: 'Conversation cancelled.',
    });
  } catch (error) {
    logger.error(`Error cancelling conversation: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'An error occurred while cancelling the conversation.',
    });
  }
};
