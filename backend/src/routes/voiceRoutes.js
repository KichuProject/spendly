/**
 * Voice Routes
 * Endpoints for parsing voice input
 */

const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middlewares/authMiddleware');
const { chatTransaction, confirmTransactions, cancelConversation } = require('../controllers/voiceController');

// Require authentication for all voice routes
router.use(authMiddleware);

/**
 * POST /api/voice/chat
 * Chat with the AI and extract transactions
 */
router.post('/chat', chatTransaction);

/**
 * POST /api/voice/confirm
 * Save confirmed transactions into MongoDB and clear conversation
 */
router.post('/confirm', confirmTransactions);

/**
 * POST /api/voice/cancel
 * Cancel conversation and clear context
 */
router.post('/cancel', cancelConversation);

module.exports = router;
