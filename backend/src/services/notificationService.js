/**
 * Expo Push Notification Service
 * Comprehensive push notification management with error handling
 * Sends notifications via Expo API: https://exp.host/--/api/v2/push/send
 */

const axios = require('axios');
const logger = require('../utils/logger');
const NotificationLog = require('../models/NotificationLog');
const User = require('../models/User');
const Expense = require('../models/Expense');
const DayCompletion = require('../models/DayCompletion');
const { toDateKey, getStartOfDay, getEndOfDay } = require('../utils/dateUtils');

const EXPO_PUSH_URL = process.env.EXPO_PUSH_URL || 'https://exp.host/--/api/v2/push/send';
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

/**
 * Validate Expo push token format
 * Valid tokens: ExponentPushToken[xxxxx...xxxxx]
 */
const isExpoToken = (token) => {
  return token && /^ExponentPushToken\[.+\]$/.test(token);
};

/**
 * Send single push notification to Expo API
 * @param {string} token - Expo push token
 * @param {string} title - Notification title
 * @param {string} body - Notification body
 * @param {object} data - Additional data payload
 * @returns {object} - Success status and response
 */
const sendPushNotification = async (token, title, body, data = {}) => {
  try {
    if (!token) {
      logger.warn('❌ No push token provided');
      return { success: false, error: 'No token provided' };
    }

    if (!isExpoToken(token)) {
      logger.warn(`❌ Invalid Expo token format: ${token}`);
      return { success: false, error: 'Invalid token format' };
    }

    const message = {
      to: token,
      title,
      body,
      data,
      sound: 'default',
      badge: 1,
      priority: 'high',
      channelId: 'daily-reminders',
      ttl: 86400, // 24 hours
    };

    const response = await axios.post(EXPO_PUSH_URL, message, {
      headers: {
        'Accept': 'application/json',
        'Accept-Encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
      },
      timeout: 10000, // 10 second timeout
    });

    logger.info(`✅ Push notification sent to token ${token.substring(0, 30)}... - Title: ${title}`);

    return {
      success: true,
      ticketId: response.data.data?.id,
      response: response.data,
    };
  } catch (error) {
    logger.error('❌ Failed to send push notification:', {
      token: token?.substring(0, 30),
      title,
      error: error.response?.data?.errors?.[0]?.message || error.message,
    });

    return {
      success: false,
      error: error.response?.data?.errors?.[0]?.message || error.message,
    };
  }
};

/**
 * Send batch push notifications to multiple tokens
 * @param {array} tokens - Array of Expo push tokens
 * @param {string} title - Notification title
 * @param {string} body - Notification body
 * @param {object} data - Additional data payload
 * @returns {object} - Sent count, failed count, and response
 */
const sendBatchNotifications = async (tokens, title, body, data = {}) => {
  try {
    const validTokens = tokens.filter((t) => isExpoToken(t));

    if (validTokens.length === 0) {
      logger.warn('❌ No valid Expo tokens in batch');
      return { success: false, sent: 0, failed: 0 };
    }

    const messages = validTokens.map((token) => ({
      to: token,
      title,
      body,
      data,
      sound: 'default',
      badge: 1,
      priority: 'high',
      channelId: 'daily-reminders',
      ttl: 86400,
    }));

    const response = await axios.post(EXPO_PUSH_URL, messages, {
      headers: {
        'Accept': 'application/json',
        'Accept-Encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
      },
      timeout: 15000, // 15 second timeout for batch
    });

    const sent = response.data.data?.filter((r) => r.status === 'ok').length || 0;
    const failed = response.data.data?.filter((r) => r.status === 'error').length || 0;

    logger.info(`✅ Batch push notifications sent. Sent: ${sent}, Failed: ${failed}`);

    return {
      success: true,
      sent,
      failed,
      response: response.data,
    };
  } catch (error) {
    logger.error('❌ Failed to send batch notifications:', error.message);

    return {
      success: false,
      sent: 0,
      failed: tokens.length,
      error: error.message,
    };
  }
};

/**
 * Send daily reminder notification with proper messaging
 * @param {object} user - User document with push token
 * @param {string} type - Notification type ('10PM' or '11PM')
 * @returns {object} - Result with success status
 */
const sendDailyReminderNotification = async (user, type) => {
  try {
    const token = user.expoPushToken;

    if (!token) {
      logger.warn(`❌ No push token for user ${user._id}`);
      return { success: false, error: 'No push token' };
    }

    let title = '';
    let body = '';

    if (type === '10PM') {
      title = '💎 Daily Expense Reminder';
      body = "Don't forget to log your expenses for today!";
    } else if (type === '11PM') {
      title = '⏰ Last Chance!';
      body = 'Log your expenses before midnight to complete your day!';
    }

    const result = await sendPushNotification(token, title, body, {
      type: 'expense_reminder',
      notificationType: type,
      timestamp: new Date().toISOString(),
    });

    // Log to database
    if (result.success) {
      try {
        const today = new Date();
        const dateKey = toDateKey(today);

        await NotificationLog.create({
          userId: user._id,
          type,
          reason: 'day_incomplete',
          title,
          body,
          status: 'sent',
          deviceToken: token,
          response: result.response,
          dateKey,
        });
      } catch (logError) {
        logger.error('Failed to log notification:', logError.message);
      }
    }

    return result;
  } catch (error) {
    logger.error(`Error sending daily reminder to user ${user._id}:`, error);
    return { success: false, error: error.message };
  }
};

/**
 * Determine if user should receive notification
 * @param {object} user - User document
 * @returns {object} - Decision with reason
 */
const shouldNotifyUser = async (user) => {
  try {
    const today = new Date();
    const dateKey = toDateKey(today);
    const startOfDay = getStartOfDay();
    const endOfDay = getEndOfDay();

    // Check if day is marked complete
    const dayCompletion = await DayCompletion.findOne({
      userId: user._id,
      dateKey,
    });

    const isDayComplete = dayCompletion?.isComplete || false;

    if (isDayComplete) {
      return {
        shouldNotify: false,
        reason: 'day_already_complete',
      };
    }

    // Get today's expenses
    const todayExpenses = await Expense.find({
      userId: user._id,
      date: {
        $gte: startOfDay,
        $lte: endOfDay,
      },
    });

    const totalAmount = todayExpenses.reduce((sum, exp) => sum + exp.amount, 0);
    const expenseCount = todayExpenses.length;

    return {
      shouldNotify: true,
      reason: expenseCount === 0 ? 'no_expenses_today' : 'day_incomplete',
      totalAmount,
      expenseCount,
      isDayComplete,
    };
  } catch (error) {
    logger.error(`Error checking notification status for user ${user._id}:`, error);
    return { shouldNotify: false, reason: 'error_checking_status' };
  }
};

/**
 * Check if user already received notification of this type today
 * @param {string} userId - User ID
 * @param {string} type - Notification type ('10PM' or '11PM')
 * @returns {boolean} - True if already notified
 */
const isAlreadyNotifiedToday = async (userId, type) => {
  try {
    const today = new Date();
    const dateKey = toDateKey(today);

    const notification = await NotificationLog.findOne({
      userId,
      type,
      dateKey,
      status: 'sent',
    });

    return !!notification;
  } catch (error) {
    logger.error(`Error checking notification status:`, error);
    return false;
  }
};

/**
 * Get notification statistics for today
 * @returns {object} - Statistics about notifications sent
 */
const getNotificationStats = async () => {
  try {
    const today = new Date();
    const dateKey = toDateKey(today);

    const stats = await NotificationLog.aggregate([
      {
        $match: {
          dateKey,
        },
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    const result = {
      date: dateKey,
      sent: 0,
      failed: 0,
      skipped: 0,
    };

    stats.forEach((stat) => {
      if (stat._id === 'sent') result.sent = stat.count;
      if (stat._id === 'failed') result.failed = stat.count;
      if (stat._id === 'skipped') result.skipped = stat.count;
    });

    return result;
  } catch (error) {
    logger.error('Error getting notification stats:', error);
    return { date: toDateKey(new Date()), sent: 0, failed: 0, skipped: 0 };
  }
};

module.exports = {
  isExpoToken,
  sendPushNotification,
  sendBatchNotifications,
  sendDailyReminderNotification,
  shouldNotifyUser,
  isAlreadyNotifiedToday,
  getNotificationStats,
};
