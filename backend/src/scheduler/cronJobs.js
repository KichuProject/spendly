/**
 * Complete Scheduler System
 * Handles all automated tasks:
 * 1. Push notifications at 10 PM and 11 PM
 * 2. Brevo keep-alive email monthly
 */

const cron = require('node-cron');
const User = require('../models/User');
const Expense = require('../models/Expense');
const DayCompletion = require('../models/DayCompletion');
const NotificationLog = require('../models/NotificationLog');
const {
  sendDailyReminderNotification,
  shouldNotifyUser,
  isAlreadyNotifiedToday,
  getNotificationStats,
} = require('../services/notificationService');
const { sendBrevoKeepAliveEmail } = require('../services/brevoService');
const { toDateKey } = require('../utils/dateUtils');
const logger = require('../utils/logger');

let job10PM = null;
let job11PM = null;
let jobBrevoKeepAlive = null;

// ==================== PUSH NOTIFICATION JOBS ====================

/**
 * Send notifications at specified time
 * Checks all users with notifications enabled and sends reminders if needed
 */
const sendNotificationsForTime = async (time) => {
  try {
    logger.info(`\n${'='.repeat(60)}`);
    logger.info(`🔔 ${time} Notification Job Started - ${new Date().toISOString()}`);
    logger.info(`${'='.repeat(60)}`);

    // Get all users with push tokens and notifications enabled
    const users = await User.find({
      expoPushToken: { $exists: true, $ne: null },
      notificationEnabled: true,
      isActive: true,
    });

    logger.info(`📊 Found ${users.length} active users with push tokens`);

    let sent = 0;
    let skipped = 0;
    let failed = 0;
    let errors = [];

    for (const user of users) {
      try {
        // Check if already notified with this type today
        const alreadyNotified = await isAlreadyNotifiedToday(user._id, time);

        if (alreadyNotified) {
          logger.debug(`⏭️ User ${user.email} already notified at ${time} today`);
          skipped++;
          continue;
        }

        // Check if user should receive notification
        const { shouldNotify, reason } = await shouldNotifyUser(user);

        if (!shouldNotify) {
          logger.debug(`✓ User ${user.email} doesn't need notification`);
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
          logger.warn(`❌ Failed to send notification to ${user.email}: ${result.error}`);
          failed++;
          errors.push({
            email: user.email,
            error: result.error,
          });
        }
      } catch (error) {
        logger.error(`❌ Error processing user ${user.email}:`, error.message);
        failed++;
        errors.push({
          email: user.email,
          error: error.message,
        });
      }
    }

    const stats = {
      time,
      sent,
      skipped,
      failed,
      total: users.length,
      timestamp: new Date().toISOString(),
    };

    logger.info(`\n📈 ${time} Job Summary:`);
    logger.info(`   ✅ Sent: ${sent}`);
    logger.info(`   ⏭️  Skipped: ${skipped}`);
    logger.info(`   ❌ Failed: ${failed}`);
    logger.info(`   📊 Total: ${users.length}`);

    if (errors.length > 0) {
      logger.warn(`\n⚠️ Errors Summary:`);
      errors.slice(0, 5).forEach((err) => {
        logger.warn(`   • ${err.email}: ${err.error}`);
      });
      if (errors.length > 5) {
        logger.warn(`   ... and ${errors.length - 5} more errors`);
      }
    }

    logger.info(`${'='.repeat(60)}\n`);

    return stats;
  } catch (error) {
    logger.error(`\n❌ CRITICAL ERROR in ${time} notification job:`, error);
    logger.error(`${'='.repeat(60)}\n`);
    return {
      time,
      error: error.message,
      timestamp: new Date().toISOString(),
    };
  }
};

/**
 * Initialize push notification cron jobs
 */
const initializePushNotificationJobs = async () => {
  try {
    const timezone = process.env.CRON_TIMEZONE || 'Asia/Kolkata';

    logger.info('📅 Initializing Push Notification Jobs...');
    logger.info(`⏰ Timezone: ${timezone}`);

    // 10 PM job (22:00)
    job10PM = cron.schedule(
      '0 22 * * *',
      async () => {
        await sendNotificationsForTime('10PM');
      },
      {
        timezone,
        runOnInit: false,
      }
    );

    logger.info('✅ 10 PM notification job scheduled (22:00)');

    // 11 PM job (23:00)
    job11PM = cron.schedule(
      '0 23 * * *',
      async () => {
        await sendNotificationsForTime('11PM');
      },
      {
        timezone,
        runOnInit: false,
      }
    );

    logger.info('✅ 11 PM notification job scheduled (23:00)');
  } catch (error) {
    logger.error('❌ Failed to initialize push notification jobs:', error);
    throw error;
  }
};

// ==================== BREVO KEEP-ALIVE JOB ====================

/**
 * Brevo keep-alive job
 * Sends a monthly email to keep the Brevo API active
 * Prevents account deactivation after ~3 months of no usage
 */
const runBrevoKeepAliveJob = async () => {
  try {
    logger.info(`\n${'='.repeat(60)}`);
    logger.info(`📧 Brevo Keep-Alive Job Started - ${new Date().toISOString()}`);
    logger.info(`${'='.repeat(60)}`);

    const result = await sendBrevoKeepAliveEmail();

    if (result.success) {
      logger.info(`\n✅ Keep-Alive Email Status: SUCCESS`);
      logger.info(`   📨 Message ID: ${result.messageId}`);
      logger.info(`   ⏰ Timestamp: ${result.timestamp}`);
    } else {
      logger.error(`\n❌ Keep-Alive Email Status: FAILED`);
      logger.error(`   ⚠️ Error: ${result.error}`);
      logger.error(`   ⏰ Timestamp: ${result.timestamp}`);
    }

    logger.info(`${'='.repeat(60)}\n`);

    return result;
  } catch (error) {
    logger.error(`\n❌ CRITICAL ERROR in Brevo keep-alive job:`, error);
    logger.error(`${'='.repeat(60)}\n`);
    return {
      success: false,
      error: error.message,
      timestamp: new Date().toISOString(),
    };
  }
};

/**
 * Initialize Brevo keep-alive cron job
 * Runs on the 1st of every month at 2 AM
 */
const initializeBrevoKeepAliveJob = async () => {
  try {
    const timezone = process.env.CRON_TIMEZONE || 'Asia/Kolkata';

    logger.info('📅 Initializing Brevo Keep-Alive Job...');
    logger.info(`⏰ Timezone: ${timezone}`);

    // Run on 1st day of month at 02:00
    jobBrevoKeepAlive = cron.schedule(
      '0 2 1 * *',
      async () => {
        await runBrevoKeepAliveJob();
      },
      {
        timezone,
        runOnInit: false,
      }
    );

    logger.info('✅ Brevo keep-alive job scheduled (1st of month, 02:00)');

    // Optional: Also run on 15th of month at 02:00 for extra safety
    const jobBrevoKeepAliveSecondary = cron.schedule(
      '0 2 15 * *',
      async () => {
        logger.info('📧 Secondary Brevo keep-alive check running...');
        await runBrevoKeepAliveJob();
      },
      {
        timezone,
        runOnInit: false,
      }
    );

    logger.info('✅ Secondary Brevo keep-alive job scheduled (15th of month, 02:00)');
  } catch (error) {
    logger.error('❌ Failed to initialize Brevo keep-alive job:', error);
    throw error;
  }
};

// ==================== MAIN INITIALIZATION ====================

/**
 * Initialize all automation jobs
 * Should be called once on server startup
 */
const initializeAllJobs = async () => {
  try {
    logger.info('\n🚀 Initializing Automation Scheduler System...\n');

    // Initialize push notification jobs
    await initializePushNotificationJobs();

    // Initialize Brevo keep-alive job
    await initializeBrevoKeepAliveJob();

    logger.info('\n✅ All automation jobs initialized successfully!\n');
    logger.info('📋 Active Jobs:');
    logger.info('   • 10 PM Push Notifications (daily)');
    logger.info('   • 11 PM Push Notifications (daily)');
    logger.info('   • Brevo Keep-Alive (monthly on 1st & 15th)');
    logger.info('\n');
  } catch (error) {
    logger.error('❌ Failed to initialize all jobs:', error);
    throw error;
  }
};

/**
 * Stop all jobs (used during graceful shutdown)
 */
const stopAllJobs = () => {
  try {
    logger.info('\n🛑 Stopping all automation jobs...\n');

    if (job10PM) {
      job10PM.stop();
      logger.info('✅ 10 PM job stopped');
    }

    if (job11PM) {
      job11PM.stop();
      logger.info('✅ 11 PM job stopped');
    }

    if (jobBrevoKeepAlive) {
      jobBrevoKeepAlive.stop();
      logger.info('✅ Brevo keep-alive job stopped');
    }

    logger.info('\n✅ All jobs stopped successfully\n');
  } catch (error) {
    logger.error('❌ Error stopping jobs:', error);
  }
};

// ==================== TESTING & MANUAL TRIGGERS ====================

/**
 * Manually trigger notification job for testing
 */
const testNotificationJob = async (time = '10PM') => {
  logger.info(`\n🧪 MANUAL TEST: ${time} notification job`);
  return await sendNotificationsForTime(time);
};

/**
 * Manually trigger Brevo keep-alive for testing
 */
const testBrevoKeepAliveJob = async () => {
  logger.info(`\n🧪 MANUAL TEST: Brevo keep-alive job`);
  return await runBrevoKeepAliveJob();
};

/**
 * Get detailed job status
 */
const getJobStatus = async () => {
  try {
    const todayStats = await getNotificationStats();
    const timezone = process.env.CRON_TIMEZONE || 'Asia/Kolkata';

    return {
      status: 'active',
      timezone,
      jobs: {
        notification_10pm: {
          status: job10PM ? 'running' : 'stopped',
          schedule: '22:00 (10 PM)',
          lastRun: null,
        },
        notification_11pm: {
          status: job11PM ? 'running' : 'stopped',
          schedule: '23:00 (11 PM)',
          lastRun: null,
        },
        brevo_keep_alive: {
          status: jobBrevoKeepAlive ? 'running' : 'stopped',
          schedule: '02:00 on 1st & 15th',
          nextRun: 'Monthly',
        },
      },
      today: todayStats,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    logger.error('Error getting job status:', error);
    return { status: 'error', error: error.message };
  }
};

module.exports = {
  // Main initialization
  initializeAllJobs,
  stopAllJobs,

  // Push notification jobs
  initializePushNotificationJobs,
  sendNotificationsForTime,

  // Brevo keep-alive job
  initializeBrevoKeepAliveJob,
  runBrevoKeepAliveJob,

  // Testing
  testNotificationJob,
  testBrevoKeepAliveJob,
  getJobStatus,
};
