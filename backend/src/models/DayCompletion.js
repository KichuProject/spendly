/**
 * Day Completion Model
 * Tracks which days user has marked as complete
 */

const mongoose = require('mongoose');

const dayCompletionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    dateKey: {
      type: String,
      required: true,
      index: true,
    },

    date: {
      type: Date,
      required: true,
    },

    isComplete: {
      type: Boolean,
      default: false,
    },

    completedAt: {
      type: Date,
      default: null,
    },

    notes: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (doc, ret) => {
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Unique index for user + date
dayCompletionSchema.index({ userId: 1, dateKey: 1 }, { unique: true });
dayCompletionSchema.index({ userId: 1, date: 1 });

/**
 * Find or create day completion record
 */
dayCompletionSchema.statics.findOrCreateDay = async function (userId, dateKey, date) {
  let dayRecord = await this.findOne({ userId, dateKey });

  if (!dayRecord) {
    dayRecord = new this({
      userId,
      dateKey,
      date,
      isComplete: false,
    });
    await dayRecord.save();
  }

  return dayRecord;
};

/**
 * Mark day as complete
 */
dayCompletionSchema.methods.markComplete = async function () {
  this.isComplete = true;
  this.completedAt = new Date();
  return await this.save();
};

/**
 * Mark day as incomplete
 */
dayCompletionSchema.methods.markIncomplete = async function () {
  this.isComplete = false;
  this.completedAt = null;
  return await this.save();
};

/**
 * Get incomplete days for a user in date range
 */
dayCompletionSchema.statics.getIncompleteDays = function (userId, startDate, endDate) {
  return this.find({
    userId,
    date: {
      $gte: startDate,
      $lte: endDate,
    },
    isComplete: false,
  }).sort({ date: -1 });
};

/**
 * Get incomplete days (for notifications)
 */
dayCompletionSchema.statics.getRecentIncompleteDays = function (userId, days = 7) {
  const endDate = new Date();
  const startDate = new Date(endDate);
  startDate.setDate(startDate.getDate() - days);

  return this.find({
    userId,
    date: {
      $gte: startDate,
      $lte: endDate,
    },
    isComplete: false,
  }).sort({ date: -1 });
};

/**
 * Check if today is complete
 */
dayCompletionSchema.statics.isTodayComplete = async function (userId) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const dayRecord = await this.findOne({
    userId,
    date: { $gte: today },
  });

  return dayRecord?.isComplete || false;
};

const DayCompletion = mongoose.model('DayCompletion', dayCompletionSchema);

module.exports = DayCompletion;
