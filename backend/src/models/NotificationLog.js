/**
 * Notification Log Model
 * Tracks all sent notifications for debugging and duplicate prevention
 */

const mongoose = require('mongoose');

const notificationLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    type: {
      type: String,
      enum: ['10PM', '11PM'],
      required: true,
    },

    reason: {
      type: String,
      enum: ['day_incomplete', 'balance_zero', 'both'],
      required: true,
    },

    title: String,

    body: String,

    status: {
      type: String,
      enum: ['sent', 'failed', 'skipped'],
      default: 'sent',
    },

    errorMessage: {
      type: String,
      default: null,
    },

    deviceToken: String,

    response: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },

    dateKey: {
      type: String,
      index: true,
    },

    sentAt: {
      type: Date,
      default: () => new Date(),
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
notificationLogSchema.index({ userId: 1, dateKey: 1, type: 1 });
notificationLogSchema.index({ userId: 1, sentAt: -1 });
notificationLogSchema.index({ status: 1 });

/**
 * Check if notification already sent today
 */
notificationLogSchema.statics.isNotificationSentToday = async function (userId, type, dateKey) {
  const count = await this.countDocuments({
    userId,
    type,
    dateKey,
    status: 'sent',
  });

  return count > 0;
};

/**
 * Check if notification was sent in last N hours
 */
notificationLogSchema.statics.checkRecentNotification = async function (userId, type, hours = 1) {
  const timeLimit = new Date(Date.now() - hours * 60 * 60 * 1000);

  const count = await this.countDocuments({
    userId,
    type,
    sentAt: { $gte: timeLimit },
    status: 'sent',
  });

  return count > 0;
};

/**
 * Log sent notification
 */
notificationLogSchema.statics.logNotification = async function (userId, type, reason, title, body, status = 'sent', error = null) {
  const today = new Date();
  const dateKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  const log = new this({
    userId,
    type,
    reason,
    title,
    body,
    status,
    errorMessage: error,
    dateKey,
  });

  return await log.save();
};

/**
 * Get notification history for user
 */
notificationLogSchema.statics.getUserHistory = function (userId, days = 7) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  return this.find({
    userId,
    createdAt: { $gte: startDate },
  }).sort({ sentAt: -1 });
};

const NotificationLog = mongoose.model('NotificationLog', notificationLogSchema);

module.exports = NotificationLog;
