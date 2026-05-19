/**
 * Auth Routes
 */

const express = require('express');
const router = express.Router();
const {
  handleSendOTP,
  handleVerifyOTP,
  handleRefreshToken,
  handleLogout,
  handleResendOTP,
  handleForgotPassword,
  handleResetPassword,
  handleVerifyResetToken,
  handleLogin,
} = require('../controllers/authController');
const { authMiddleware } = require('../middlewares/authMiddleware');

/**
 * POST /api/auth/login
 * Direct password-based login
 */
router.post('/login', handleLogin);

/**
 * POST /api/auth/send-otp
 * Send OTP to email for signup
 */
router.post('/send-otp', handleSendOTP);

/**
 * POST /api/auth/verify-otp
 * Verify OTP and get tokens
 */
router.post('/verify-otp', handleVerifyOTP);

/**
 * POST /api/auth/refresh-token
 * Get new access token
 */
router.post('/refresh-token', handleRefreshToken);

/**
 * POST /api/auth/resend-otp
 * Resend OTP
 */
router.post('/resend-otp', handleResendOTP);

/**
 * POST /api/auth/forgot-password
 * Send password reset link to email
 */
router.post('/forgot-password', handleForgotPassword);

/**
 * POST /api/auth/verify-spendreset-token
 * Verify if reset token is valid
 */
router.post('/verify-spendreset-token', handleVerifyResetToken);

/**
 * POST /api/auth/spendreset-password
 * Reset password with token
 */
router.post('/spendreset-password', handleResetPassword);

/**
 * POST /api/auth/logout
 * Logout user
 */
router.post('/logout', authMiddleware, handleLogout);

module.exports = router;
