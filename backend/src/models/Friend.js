/**
 * Friend Model
 * Stores friend information for split expenses
 */

const mongoose = require('mongoose');

const friendSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    name: {
      type: String,
      required: [true, 'Friend name is required'],
      trim: true,
      minlength: 2,
      maxlength: 100,
    },

    initials: {
      type: String,
      maxlength: 2,
    },

    gradientIndex: {
      type: Number,
      default: 0,
      min: 0,
      max: 9,
    },

    gradient: {
      type: [String],
      default: ['#7C3AED', '#4F46E5'],
    },

    phone: {
      type: String,
      default: null,
    },

    email: {
      type: String,
      default: null,
    },

    profileImage: {
      type: String,
      default: null,
    },

    isActive: {
      type: Boolean,
      default: true,
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

// Indexes for faster queries
friendSchema.index({ userId: 1, name: 1 });
friendSchema.index({ userId: 1, createdAt: 1 });

/**
 * Generate initials from name
 */
friendSchema.statics.generateInitials = (name) => {
  if (!name) return '??';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
};

/**
 * Find friend by name for a user
 */
friendSchema.statics.findByName = function (userId, name) {
  return this.findOne({
    userId,
    name: { $regex: `^${name}$`, $options: 'i' },
  });
};

/**
 * Search friends
 */
friendSchema.statics.searchFriends = function (userId, query) {
  return this.find({
    userId,
    isActive: true,
    $or: [
      { name: { $regex: query, $options: 'i' } },
      { email: { $regex: query, $options: 'i' } },
    ],
  }).sort({ name: 1 });
};

const Friend = mongoose.model('Friend', friendSchema);

module.exports = Friend;
