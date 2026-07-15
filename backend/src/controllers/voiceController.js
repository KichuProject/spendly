/**
 * Voice Controller
 * Handles conversational parsing and confirming of voice transactions
 */

const { chatWithNvidia } = require('../utils/nvidiaAi');
const { getStartOfDay, addDays, toDateKey } = require('../utils/dateUtils');
const { validateTransactions } = require('../utils/voiceValidation');
const conversationManager = require('../utils/conversationManager');
const voiceService = require('../services/voiceService');
const logger = require('../utils/logger');

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

    // Call AI with full history
    const parsedResult = await chatWithNvidia(conv.messages);

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
      return res.status(200).json({
        success: true,
        conversationId: conv.conversationId,
        confirmationRequired: false,
        reply: typeof parsedResult === 'string' ? parsedResult : jsonPayload.reply,
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
