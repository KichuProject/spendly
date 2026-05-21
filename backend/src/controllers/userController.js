/**
 * User Controller
 * Handles user-specific endpoints (push tokens, settings, etc)
 */

const User = require('../models/User');
const { isExpoToken } = require('../services/notificationService');
const logger = require('../utils/logger');

/**
 * POST /api/users/register-push-token
 * Register Expo push token for notifications
 */
const handleRegisterPushToken = async (req, res, next) => {
  try {
    const userId = req.userId;
    const { token } = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Push token is required',
      });
    }

    // Validate Expo token format
    if (!isExpoToken(token)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Expo push token format',
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Update push token
    user.expoPushToken = token;
    await user.save();

    logger.info(`✅ Push token registered for user ${user.email}`);

    res.status(200).json({
      success: true,
      message: 'Push token registered successfully',
      user: user.toPublicJSON(),
    });
  } catch (error) {
    logger.error('Error in handleRegisterPushToken:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to register push token',
    });
  }
};

/**
 * POST /api/users/disable-notifications
 * Disable push notifications for user
 */
const handleDisableNotifications = async (req, res, next) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    user.notificationEnabled = false;
    await user.save();

    logger.info(`✅ Notifications disabled for user ${user.email}`);

    res.status(200).json({
      success: true,
      message: 'Notifications disabled',
      user: user.toPublicJSON(),
    });
  } catch (error) {
    logger.error('Error in handleDisableNotifications:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to disable notifications',
    });
  }
};

/**
 * POST /api/users/enable-notifications
 * Enable push notifications for user
 */
const handleEnableNotifications = async (req, res, next) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    user.notificationEnabled = true;
    await user.save();

    logger.info(`✅ Notifications enabled for user ${user.email}`);

    res.status(200).json({
      success: true,
      message: 'Notifications enabled',
      user: user.toPublicJSON(),
    });
  } catch (error) {
    logger.error('Error in handleEnableNotifications:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to enable notifications',
    });
  }
};

/**
 * GET /api/users/me
 * Get current user profile
 */
const handleGetProfile = async (req, res, next) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Calculate and update daily login streak
    const now = new Date();
    const lastLogin = user.lastLogin;

    if (!lastLogin) {
      user.loginStreak = 1;
      user.lastLogin = now;
      await user.save();
    } else {
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const lastDate = new Date(lastLogin.getFullYear(), lastLogin.getMonth(), lastLogin.getDate());
      const diffTime = today - lastDate;
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        // Consecutive day visit - increment streak
        user.loginStreak = (user.loginStreak || 0) + 1;
        user.lastLogin = now;
        await user.save();
      } else if (diffDays > 1) {
        // Missed a whole day - reset streak to 1 (new login session today)
        user.loginStreak = 1;
        user.lastLogin = now;
        await user.save();
      } else if (diffDays === 0) {
        // Same day opening - keep current streak, just refresh lastLogin timestamp
        user.lastLogin = now;
        await user.save();
      }
    }

    res.status(200).json({
      success: true,
      data: user.toPublicJSON(),
    });
  } catch (error) {
    logger.error('Error in handleGetProfile:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch profile',
    });
  }
};

/**
 * PUT /api/users/me
 * Update user profile (name, email, currency, phone)
 */
const handleUpdateProfile = async (req, res, next) => {
  try {
    const userId = req.userId;
    const { name, email, currency, phone } = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Update allowed fields
    if (name) user.name = name.trim();
    if (email) {
      // Check if email already exists
      const existingUser = await User.findOne({ email: email.toLowerCase(), _id: { $ne: userId } });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Email already in use',
        });
      }
      user.email = email.toLowerCase().trim();
    }
    if (currency) user.currency = currency;
    if (phone !== undefined) {
      if (phone === null || phone.trim() === '') {
        user.phone = undefined;
      } else {
        const trimmedPhone = phone.trim();
        if (!/^\d{10}$/.test(trimmedPhone)) {
          return res.status(400).json({
            success: false,
            message: 'Phone number must be exactly 10 digits',
          });
        }
        const existingPhone = await User.findOne({ phone: trimmedPhone, _id: { $ne: userId } });
        if (existingPhone) {
          return res.status(400).json({
            success: false,
            message: 'Phone number already in use',
          });
        }
        user.phone = trimmedPhone;
      }
    }

    await user.save();

    logger.info(`✅ User profile updated: ${user.email}`);

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: user.toPublicJSON(),
    });
  } catch (error) {
    logger.error('Error in handleUpdateProfile:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile',
    });
  }
};

/**
 * POST /api/users/change-password
 * Change password for authenticated user
 */
const handleChangePassword = async (req, res, next) => {
  try {
    const userId = req.userId;
    const { currentPassword, newPassword } = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password and new password are required',
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters',
      });
    }

    // Get user with password field (select: false by default)
    const user = await User.findById(userId).select('+password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Verify current password
    const isPasswordValid = await user.comparePassword(currentPassword);
    
    if (!isPasswordValid) {
      logger.warn(`⚠️ Invalid password attempt for user ${user.email}`);
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect',
      });
    }

    // Set new password
    await user.setPassword(newPassword);

    logger.info(`✅ Password changed successfully for user ${user.email}`);

    res.status(200).json({
      success: true,
      message: 'Password changed successfully',
      user: user.toPublicJSON(),
    });
  } catch (error) {
    logger.error('Error in handleChangePassword:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to change password',
    });
  }
};

const handleSendTestPush = async (req, res, next) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    if (!user.expoPushToken) {
      return res.status(400).json({
        success: false,
        message: 'No push token registered for this user. Open the app to register.',
      });
    }

    const { sendPushNotification } = require('../services/notificationService');
    
    logger.info(`Sending test notification to ${user.email}`);

    const result = await sendPushNotification(
      user.expoPushToken,
      'Test Notification 💰',
      'Spendly Test: Tap to open the Add Expense page!',
      {
        screen: 'AddExpense',
        test: true,
      }
    );

    if (result.success) {
      return res.status(200).json({
        success: true,
        message: 'Test notification sent successfully',
        result,
      });
    } else {
      return res.status(500).json({
        success: false,
        message: 'Failed to send notification: ' + result.error,
      });
    }
  } catch (error) {
    logger.error('Error in handleSendTestPush:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while sending test notification',
    });
  }
};

/**
 * POST /api/users/dismiss-notifications
 * Dismiss notifications by adding dateKeys to user's deletedNotifications
 */
const handleDismissNotifications = async (req, res, next) => {
  try {
    const userId = req.userId;
    const { dateKeys } = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    if (!dateKeys || !Array.isArray(dateKeys)) {
      return res.status(400).json({
        success: false,
        message: 'dateKeys array is required',
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Add unique keys to user's deletedNotifications array
    const currentList = new Set(user.deletedNotifications || []);
    dateKeys.forEach((key) => currentList.add(key));
    user.deletedNotifications = Array.from(currentList);

    await user.save();

    logger.info(`✅ Notifications dismissed for user ${user.email}: ${dateKeys.join(', ')}`);

    res.status(200).json({
      success: true,
      message: 'Notifications dismissed successfully',
      deletedNotifications: user.deletedNotifications,
    });
  } catch (error) {
    logger.error('Error in handleDismissNotifications:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to dismiss notifications',
    });
  }
};

module.exports = {
  handleRegisterPushToken,
  handleDisableNotifications,
  handleEnableNotifications,
  handleGetProfile,
  handleUpdateProfile,
  handleChangePassword,
  handleSendTestPush,
  handleDismissNotifications,
};
