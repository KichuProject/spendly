/**
 * User Model
 * Stores user information, authentication data, and push tokens
 */

const mongoose = require('mongoose');
const { hashString, compareHash, encryptPassword, decryptPassword } = require('../utils/hashUtils');
const logger = require('../utils/logger');

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Invalid email format'],
      index: true,
    },

    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: 2,
      maxlength: 100,
    },

    isEmailVerified: {
      type: Boolean,
      default: false,
    },

    // Push Notifications
    expoPushToken: {
      type: String,
      default: null,
      index: true,
    },

    // Notification Tracking
    lastNotificationDate: {
      type: Date,
      default: null,
    },

    lastNotificationType: {
      type: String,
      enum: ['10PM', '11PM', null],
      default: null,
    },

    notificationEnabled: {
      type: Boolean,
      default: true,
    },

    // Currency preference
    currency: {
      type: String,
      default: 'INR',
    },

    phone: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
      match: [/^\d{10}$/, 'Phone number must be exactly 10 digits'],
    },

    // User status
    isActive: {
      type: Boolean,
      default: true,
    },

    isAdmin: {
      type: Boolean,
      default: false,
    },

    // Metadata
    lastLogin: {
      type: Date,
      default: null,
    },

    loginStreak: {
      type: Number,
      default: 0,
    },

    // Password field (for accounts with password)
    password: {
      type: String,
      default: null,
      select: false, // Don't return password by default
    },

    // Password reset token for forgot password flow
    passwordResetToken: {
      type: String,
      default: null,
      index: true,
    },

    // Expiry time for password reset token
    passwordResetExpiry: {
      type: Date,
      default: null,
    },

    // Track when password was last changed
    passwordChangedAt: {
      type: Date,
      default: null,
    },
    deletedNotifications: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (doc, ret) => {
        delete ret.__v;
        delete ret.password;
        delete ret.passwordResetToken;
        return ret;
      },
    },
  }
);

// Index for faster queries
userSchema.index({ email: 1 });
userSchema.index({ passwordResetToken: 1, passwordResetExpiry: 1 });
userSchema.index({ createdAt: 1 });
userSchema.index({ expoPushToken: 1 });

/**
 * Get user data without sensitive info
 */
userSchema.methods.toPublicJSON = function () {
  return {
    _id: this._id,
    email: this.email,
    name: this.name,
    phone: this.phone,
    currency: this.currency,
    isEmailVerified: this.isEmailVerified,
    isActive: this.isActive,
    lastLogin: this.lastLogin,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
    deletedNotifications: this.deletedNotifications || [],
  };
};

/**
 * Find user by email
 */
userSchema.statics.findByEmail = function (email) {
  return this.findOne({ email: email.toLowerCase() });
};

/**
 * Check if user has valid push token
 */
userSchema.methods.hasPushToken = function () {
  return !!this.expoPushToken && this.expoPushToken.length > 0;
};

/**
 * Update last notification details
 */
userSchema.methods.updateLastNotification = async function (type) {
  this.lastNotificationDate = new Date();
  this.lastNotificationType = type; // '10PM' or '11PM'
  return await this.save();
};

/**
 * Get users who need notifications for today
 * (Past 24 hours or today in user's timezone)
 */
userSchema.statics.getUsersForNotification = async function (type) {
  // Get today's date at midnight UTC
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  return this.find({
    expoPushToken: { $exists: true, $ne: null },
    notificationEnabled: true,
    isActive: true,
    lastNotificationType: { $ne: type }, // Not already notified with this type today
  });
};

/**
 * Encrypt and set password (reversible encryption)
 */
userSchema.methods.setPassword = async function (password) {
  this.password = encryptPassword(password);
  this.passwordChangedAt = new Date();
  return await this.save();
};

/**
 * Compare password (decrypt and compare)
 */
userSchema.methods.comparePassword = async function (enteredPassword) {
  if (!this.password) {
    return false;
  }
  try {
    const decryptedPassword = decryptPassword(this.password);
    return decryptedPassword === enteredPassword;
  } catch (error) {
    logger.error('Error comparing password:', error);
    return false;
  }
};

/**
 * Generate password reset token
 */
userSchema.methods.generatePasswordResetToken = async function () {
  const resetToken = require('crypto').randomBytes(32).toString('hex');
  
  // Hash the token and save to DB
  this.passwordResetToken = await hashString(resetToken);
  this.passwordResetExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes expiry
  
  await this.save();
  
  // Return unhashed token to send to user
  return resetToken;
};

/**
 * Verify password reset token
 */
userSchema.methods.verifyPasswordResetToken = async function (token) {
  if (!this.passwordResetToken || !this.passwordResetExpiry) {
    return false;
  }
  
  // Check if token expired
  if (new Date() > this.passwordResetExpiry) {
    return false;
  }
  
  // Verify token matches hashed version
  return await compareHash(token, this.passwordResetToken);
};

/**
 * Clear password reset token
 */
userSchema.methods.clearPasswordResetToken = async function () {
  this.passwordResetToken = null;
  this.passwordResetExpiry = null;
  return await this.save();
};

const User = mongoose.model('User', userSchema);

module.exports = User;
