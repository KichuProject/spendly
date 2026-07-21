/**
 * Expense Model
 * Stores expense records with split information
 */

const mongoose = require('mongoose');

const splitSchema = new mongoose.Schema(
  {
    friendId: mongoose.Schema.Types.ObjectId,
    friendName: String,
    amount: Number,
    direction: {
      type: String,
      enum: ['theyOwe', 'iOwe'],
    },
    paid: {
      type: Boolean,
      default: false,
    },
  },
  { _id: false }
);

const expenseSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0, 'Amount must be positive'],
    },

    reason: {
      type: String,
      required: [true, 'Reason is required'],
      trim: true,
    },

    category: {
      type: String,
      default: 'Other',
    },

    emoji: {
      type: String,
      default: '💰',
    },

    date: {
      type: Date,
      required: true,
      index: true,
    },

    dateKey: {
      type: String,
      required: true,
      index: true,
    },

    type: {
      type: String,
      enum: ['solo', 'split', 'friend', 'income'],
      default: 'solo',
    },

    splits: [splitSchema],

    notes: {
      type: String,
      default: null,
    },

    tags: [String],

    paymentMethod: {
      type: String,
      default: 'cash',
    },

    source: {
      type: String,
      default: null,
    },

    account: {
      type: String,
      default: 'Cash',
    },

    recurring: {
      type: Boolean,
      default: false,
    },

    frequency: {
      type: String,
      enum: ['one-time', 'daily', 'weekly', 'biweekly', 'monthly', 'quarterly', 'yearly', 'custom', null],
      default: null,
    },

    attachment: {
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

// Indexes
expenseSchema.index({ userId: 1, date: -1 });
expenseSchema.index({ userId: 1, dateKey: 1 });
expenseSchema.index({ userId: 1, 'splits.friendId': 1 });
expenseSchema.index({ category: 1 });

/**
 * Get total for a specific day
 */
expenseSchema.statics.getDayTotal = function (userId, dateKey) {
  return this.aggregate([
    {
      $match: {
        userId: mongoose.Types.ObjectId(userId),
        dateKey,
      },
    },
    {
      $group: {
        _id: null,
        total: { $sum: '$amount' },
        count: { $sum: 1 },
      },
    },
  ]);
};

/**
 * Get expenses in date range
 */
expenseSchema.statics.getInDateRange = function (userId, startDate, endDate) {
  return this.find({
    userId,
    date: {
      $gte: startDate,
      $lte: endDate,
    },
  }).sort({ date: -1 });
};

/**
 * Get category breakdown
 */
expenseSchema.statics.getCategoryBreakdown = async function (userId, startDate, endDate) {
  return this.aggregate([
    {
      $match: {
        userId: mongoose.Types.ObjectId(userId),
        date: {
          $gte: startDate,
          $lte: endDate,
        },
      },
    },
    {
      $group: {
        _id: '$category',
        emoji: { $first: '$emoji' },
        total: { $sum: '$amount' },
        count: { $sum: 1 },
      },
    },
    {
      $sort: { total: -1 },
    },
  ]);
};

/**
 * Get top expenses
 */
expenseSchema.statics.getTopExpenses = function (userId, limit = 10) {
  return this.find({ userId }).sort({ amount: -1 }).limit(limit);
};

/**
 * Get total spending in date range
 */
expenseSchema.statics.getTotalInRange = async function (userId, startDate, endDate) {
  const result = await this.aggregate([
    {
      $match: {
        userId: mongoose.Types.ObjectId(userId),
        date: {
          $gte: startDate,
          $lte: endDate,
        },
      },
    },
    {
      $group: {
        _id: null,
        total: { $sum: '$amount' },
        count: { $sum: 1 },
      },
    },
  ]);

  return result[0] || { total: 0, count: 0 };
};

const Expense = mongoose.model('Expense', expenseSchema);

module.exports = Expense;
