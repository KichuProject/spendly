/**
 * Authentication Controller
 * Handles authentication endpoints
 */

const User = require('../models/User');
const {
  sendOTP,
  verifyOTP,
  refreshAccessToken,
  logout,
  resendOTP,
  login,
} = require('../services/authService');
const { sendEmail } = require('../services/brevoService');
const logger = require('../utils/logger');

/**
 * POST /api/auth/send-otp
 * Send OTP to email
 */
const handleSendOTP = async (req, res, next) => {
  try {
    const { email, type, phone } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required',
      });
    }

    const validType = type === 'signup' ? 'signup' : 'login';

    const result = await sendOTP(email, validType, phone);

    res.status(200).json(result);
  } catch (error) {
    logger.error('Error in handleSendOTP:', error);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * POST /api/auth/verify-otp
 * Verify OTP and authenticate user
 */
const handleVerifyOTP = async (req, res, next) => {
  try {
    const { email, otp, name, password, phone } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Email and OTP are required',
      });
    }

    if (otp.length !== 6 || !/^\d{6}$/.test(otp)) {
      return res.status(400).json({
        success: false,
        message: 'OTP must be 6 digits',
      });
    }

    const result = await verifyOTP(email, otp, name, password, phone);

    res.status(200).json(result);
  } catch (error) {
    logger.error('Error in handleVerifyOTP:', error);
    res.status(401).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * POST /api/auth/refresh-token
 * Get new access token using refresh token
 */
const handleRefreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: 'Refresh token is required',
      });
    }

    const result = await refreshAccessToken(refreshToken);

    res.status(200).json(result);
  } catch (error) {
    logger.error('Error in handleRefreshToken:', error);
    res.status(401).json({
      success: false,
      message: 'Invalid or expired refresh token',
    });
  }
};

/**
 * POST /api/auth/logout
 * Logout user
 */
const handleLogout = async (req, res, next) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    const result = await logout(userId);

    res.status(200).json(result);
  } catch (error) {
    logger.error('Error in handleLogout:', error);
    res.status(500).json({
      success: false,
      message: 'Logout failed',
    });
  }
};

/**
 * POST /api/auth/resend-otp
 * Resend OTP
 */
const handleResendOTP = async (req, res, next) => {
  try {
    const { email, type, phone } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required',
      });
    }

    const validType = type === 'signup' ? 'signup' : 'login';

    const result = await resendOTP(email, validType, phone);

    res.status(200).json(result);
  } catch (error) {
    logger.error('Error in handleResendOTP:', error);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * POST /api/auth/forgot-password
 * Send password reset link to email
 */
const handleForgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required',
      });
    }

    // Find user by email
    const user = await User.findByEmail(email);

    if (!user) {
      // Return error if email doesn't exist
      return res.status(404).json({
        success: false,
        message: 'Email does not exist in our database',
      });
    }

    // Generate password reset token
    const resetToken = await user.generatePasswordResetToken();

    // Determine the base URL dynamically based on the request (allows testing on local network/production automatically)
    const protocol = req.headers['x-forwarded-proto'] || req.protocol;
    const host = req.get('host');
    const resetBaseUrl = process.env.RESET_PASSWORD_URL || `${protocol}://${host}`;

    // Create reset link pointing to our beautiful HTML page served by backend
    const resetLink = `${resetBaseUrl}/spendreset?token=${resetToken}&email=${encodeURIComponent(user.email)}`;

    // Send email with reset link
    try {
      await sendEmail({
        to: user.email,
        subject: 'Password Reset Request - Spendly',
        htmlContent: `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #000000; color: #FFFFFF; min-height: 100vh;">
              <div style="max-width: 520px; margin: 40px auto; padding: 0 20px;">
                <!-- Luxury OLED Card -->
                <div style="background: #0A0A0E; border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 28px; padding: 44px 32px; box-shadow: 0 20px 50px rgba(0, 0, 0, 0.8);">
                  
                  <!-- Brand Header -->
                  <div style="text-align: center; margin-bottom: 28px;">
                    <div style="display: inline-block; width: 60px; height: 60px; border-radius: 20px; background: linear-gradient(135deg, #059669 0%, #0EA5E9 50%, #6366F1 100%); line-height: 60px; font-size: 28px; color: #FFFFFF; box-shadow: 0 0 35px rgba(14, 165, 233, 0.4);">🔑</div>
                    <h1 style="color: #FFFFFF; margin: 16px 0 4px 0; font-size: 26px; font-weight: 800; letter-spacing: -0.5px;">Reset Your Password</h1>
                    <p style="color: #A1A1AA; font-size: 14px; margin: 0;">Spendly Security Request</p>
                  </div>

                  <p style="color: #E4E4E7; font-size: 15px; line-height: 1.6; margin: 0 0 24px 0;">
                    Hi <strong style="color: #FFFFFF;">${user.name}</strong>, we received a request to reset your Spendly account password. Click the button below to set a new password:
                  </p>

                  <!-- Reset CTA Button -->
                  <div style="text-align: center; margin-bottom: 28px;">
                    <a href="${resetLink}" style="display: inline-block; background: linear-gradient(135deg, #059669 0%, #0EA5E9 50%, #6366F1 100%); color: #FFFFFF; text-decoration: none; padding: 16px 36px; border-radius: 16px; font-weight: 800; font-size: 15px; box-shadow: 0 0 35px rgba(14, 165, 233, 0.4); letter-spacing: 0.3px;">
                      Reset Password Now →
                    </a>
                  </div>

                  <!-- Fallback Link -->
                  <div style="background: #121218; border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 14px; padding: 14px; margin-bottom: 24px; font-size: 12px; color: #A1A1AA; word-break: break-all;">
                    Or copy & paste this direct URL in your browser:
                    <div style="color: #38BDF8; font-family: monospace; font-size: 11px; margin-top: 6px;">${resetLink}</div>
                  </div>

                  <!-- Expiry Alert -->
                  <div style="background: rgba(244, 63, 94, 0.1); border: 1px solid rgba(244, 63, 94, 0.25); border-radius: 14px; padding: 14px; text-align: center; margin-bottom: 24px;">
                    <p style="color: #F43F5E; font-size: 13px; font-weight: 700; margin: 0;">⏱️ This reset link expires in 15 minutes and can only be used once.</p>
                  </div>

                  <!-- Divider -->
                  <div style="height: 1px; background: rgba(255, 255, 255, 0.08); margin-bottom: 24px;"></div>

                  <!-- Footer -->
                  <p style="color: #71717A; font-size: 12px; text-align: center; margin: 0 0 6px 0;">
                    If you didn't request this password reset, your account remains secure.
                  </p>
                  <p style="color: #52525B; font-size: 11px; text-align: center; margin: 0;">
                    © 2026 Spendly Inc. All rights reserved.
                  </p>
                  
                </div>
              </div>
            </body>
          </html>
        `,
      });
    } catch (emailError) {
      logger.error('Failed to send reset email:', emailError);
      // Clear the token if email send fails
      user.passwordResetToken = null;
      user.passwordResetExpiry = null;
      await user.save();
      
      return res.status(500).json({
        success: false,
        message: 'Failed to send reset email. Please try again later',
      });
    }

    logger.info(`✅ Password reset token generated for user ${user.email}`);

    // Return success with confirmation message
    res.status(200).json({
      success: true,
      message: 'Password reset link has been sent to your email',
    });
  } catch (error) {
    logger.error('Error in handleForgotPassword:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process password reset request',
    });
  }
};

/**
 * POST /api/auth/reset-password
 * Reset password with token
 */
const handleResetPassword = async (req, res, next) => {
  try {
    const { email, token, newPassword } = req.body;

    if (!email || !token || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Email, reset token, and new password are required',
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters',
      });
    }

    // Find user by email
    const user = await User.findByEmail(email);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid reset link',
      });
    }

    // Verify reset token
    const isTokenValid = await user.verifyPasswordResetToken(token);

    if (!isTokenValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired reset link',
      });
    }

    // Set new password
    await user.setPassword(newPassword);

    // Clear reset token
    await user.clearPasswordResetToken();

    logger.info(`✅ Password reset successfully for user ${user.email}`);

    res.status(200).json({
      success: true,
      message: 'Password reset successfully',
      data: {
        user: user.toPublicJSON(),
      },
    });
  } catch (error) {
    logger.error('Error in handleResetPassword:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reset password',
    });
  }
};

/**
 * POST /api/auth/verify-reset-token
 * Verify if reset token is valid
 */
const handleVerifyResetToken = async (req, res, next) => {
  try {
    const { email, token } = req.body;

    if (!email || !token) {
      return res.status(400).json({
        success: false,
        message: 'Email and reset token are required',
      });
    }

    // Find user by email
    const user = await User.findByEmail(email);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid reset link',
      });
    }

    // Verify reset token
    const isTokenValid = await user.verifyPasswordResetToken(token);

    if (!isTokenValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired reset link',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Reset token is valid',
    });
  } catch (error) {
    logger.error('Error in handleVerifyResetToken:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify reset token',
    });
  }
};

/**
 * POST /api/auth/login
 * Direct password-based login
 */
const handleLogin = async (req, res, next) => {
  try {
    const { email, emailOrPhone, password } = req.body;
    const identifier = emailOrPhone || email;

    if (!identifier || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email or Phone number and password are required',
      });
    }

    const result = await login(identifier, password);

    res.status(200).json(result);
  } catch (error) {
    logger.error('Error in handleLogin:', error);
    res.status(401).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  handleSendOTP,
  handleVerifyOTP,
  handleRefreshToken,
  handleLogout,
  handleResendOTP,
  handleForgotPassword,
  handleResetPassword,
  handleVerifyResetToken,
  handleLogin,
};
