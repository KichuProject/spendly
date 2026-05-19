/**
 * Notification Scheduler
 * Cron jobs for sending push notifications at 10 PM and 11 PM
 */

const cron = require('node-cron');
const User = require('../models/User');
const Expense = require('../models/Expense');
const DayCompletion = require('../models/DayCompletion');
const NotificationLog = require('../models/NotificationLog');
const { sendDailyReminderNotification } = require('../services/notificationService');
const { toDateKey, getStartOfDay, getEndOfDay } = require('../utils/dateUtils');
const logger = require('../utils/logger');

let job10PM = null;
let job11PM = null;

/**
 * Check if user needs notification
 * Conditions:
 * 1. Day is not marked complete
 * 2. OR today's expense balance = 0
 */
const shouldNotifyUser = async (user) => {
  try {
    const today = new Date();
    const dateKey = toDateKey(today);
    const startOfDay = getStartOfDay();
    const endOfDay = getEndOfDay();

    // Check if day is already marked complete
    const dayCompletion = await DayCompletion.findOne({
      userId: user._id,
      dateKey,
    });

    const isDayComplete = dayCompletion?.isComplete || false;

    // Get today's expenses
    const todayExpenses = await Expense.find({
      userId: user._id,
      date: {
        $gte: startOfDay,
        $lte: endOfDay,
      },
    });

    // Calculate today's total
    const totalAmount = todayExpenses.reduce((sum, exp) => sum + exp.amount, 0);

    // Notify if day is incomplete OR balance = 0
    return {
      shouldNotify: !isDayComplete || totalAmount === 0,
      reason: !isDayComplete ? 'day_incomplete' : 'balance_zero',
      totalAmount,
      isDayComplete,
    };
  } catch (error) {
    logger.error(`Error checking notification status for user ${user._id}:`, error);
    return { shouldNotify: false, reason: null };
  }
};

/**
 * Main notification sending logic
 */
const sendNotificationsForTime = async (time) => {
  try {
    logger.info(`\n🔔 ${time} Notification Job Started`);

    // Get all users with push tokens and notifications enabled
    const users = await User.find({
      expoPushToken: { $exists: true, $ne: null },
      notificationEnabled: true,
      isActive: true,
    });

    logger.info(`Found ${users.length} users with push tokens`);

    let sent = 0;
    let skipped = 0;
    let failed = 0;

    for (const user of users) {
      try {
        // Check if already notified with this type today
        const today = new Date();
        const dateKey = toDateKey(today);

        const alreadyNotified = await NotificationLog.isNotificationSentToday(
          user._id,
          time,
          dateKey
        );

        if (alreadyNotified) {
          logger.info(`⏭️ User ${user.email} already notified at ${time} today`);
          skipped++;
          continue;
        }

        // Check if user should receive notification
        const { shouldNotify, reason } = await shouldNotifyUser(user);

        if (!shouldNotify) {
          logger.info(`✓ User ${user.email} doesn't need notification (day complete or balance > 0)`);
          skipped++;
          continue;
        }

        // Send notification
        const result = await sendDailyReminderNotification(user, time);

        if (result.success) {
          // Update user's last notification info
          user.lastNotificationDate = new Date();
          user.lastNotificationType = time;
          await user.save();

          logger.info(`✅ Notification sent to ${user.email} at ${time}`);
          sent++;
        } else {
          logger.error(`❌ Failed to send notification to ${user.email}: ${result.error}`);
          failed++;
        }
      } catch (error) {
        logger.error(`Error processing user ${user.email}:`, error);
        failed++;
      }
    }

    logger.info(
      `✅ ${time} Job Complete - Sent: ${sent}, Skipped: ${skipped}, Failed: ${failed}`
    );

    return {
      time,
      sent,
      skipped,
      failed,
      total: users.length,
    };
  } catch (error) {
    logger.error(`❌ Error in ${time} notification job:`, error);
    return {
      time,
      error: error.message,
    };
  }
};

/**
 * Initialize notification cron jobs
 */
const initializeNotificationJobs = async () => {
  try {
    const timezone = process.env.CRON_TIMEZONE || 'Asia/Kolkata';

    // 10 PM job
    job10PM = cron.schedule(
      '0 22 * * *', // 10 PM (22:00)
      async () => {
        await sendNotificationsForTime('10PM');
      },
      {
        timezone,
      }
    );

    logger.info('✅ 10 PM notification job scheduled');

    // 11 PM job
    job11PM = cron.schedule(
      '0 23 * * *', // 11 PM (23:00)
      async () => {
        await sendNotificationsForTime('11PM');
      },
      {
        timezone,
      }
    );

    logger.info('✅ 11 PM notification job scheduled');
    logger.info(`⏰ Timezone: ${timezone}`);
  } catch (error) {
    logger.error('❌ Failed to initialize notification jobs:', error);
    throw error;
  }
};

/**
 * Stop notification jobs
 */
const stopNotificationJobs = () => {
  try {
    if (job10PM) {
      job10PM.stop();
      logger.info('✅ 10 PM job stopped');
    }

    if (job11PM) {
      job11PM.stop();
      logger.info('✅ 11 PM job stopped');
    }
  } catch (error) {
    logger.error('Error stopping notification jobs:', error);
  }
};

/**
 * Test notification job (manual trigger)
 */
const testNotificationJob = async (time = '10PM') => {
  logger.info(`🧪 Testing ${time} notification job`);
  return await sendNotificationsForTime(time);
};

module.exports = {
  initializeNotificationJobs,
  stopNotificationJobs,
  testNotificationJob,
  sendNotificationsForTime,
};
