/**
 * User Routes
 * Profile and notification settings
 */

const express = require('express');
const router = express.Router();
const {
  handleRegisterPushToken,
  handleDisableNotifications,
  handleEnableNotifications,
  handleGetProfile,
  handleUpdateProfile,
  handleChangePassword,
  handleSendTestPush,
  handleDismissNotifications,
} = require('../controllers/userController');

const { authMiddleware } = require('../middlewares/authMiddleware');

// All user routes require authentication
router.use(authMiddleware);

/**
 * POST /api/users/dismiss-notifications
 * Dismiss notifications by adding dateKeys to user's list
 */
router.post('/dismiss-notifications', handleDismissNotifications);

/**
 * POST /api/users/register-push-token
 * Register Expo push token
 */
router.post('/register-push-token', handleRegisterPushToken);

/**
 * POST /api/users/send-test-push
 * Send test push notification
 */
router.post('/send-test-push', handleSendTestPush);

/**
 * POST /api/users/disable-notifications
 * Disable notifications
 */
router.post('/disable-notifications', handleDisableNotifications);

/**
 * POST /api/users/enable-notifications
 * Enable notifications
 */
router.post('/enable-notifications', handleEnableNotifications);

/**
 * GET /api/users/me
 * Get user profile
 */
router.get('/me', handleGetProfile);

/**
 * PUT /api/users/me
 * Update user profile
 */
router.put('/me', handleUpdateProfile);

/**
 * POST /api/users/change-password
 * Change password
 */
router.post('/change-password', handleChangePassword);

module.exports = router;
