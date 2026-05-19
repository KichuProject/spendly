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
              <style>
                body {
                  margin: 0;
                  padding: 0;
                  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                  background: #0F0C29;
                  background-image: linear-gradient(135deg, #0F0C29 0%, #1D1845 50%, #0F0C29 100%);
                  min-height: 100vh;
                }
                .container {
                  max-width: 600px;
                  margin: 40px auto;
                  padding: 0 20px;
                }
                .card {
                  background: #151138;
                  border: 1.5px solid rgba(255, 255, 255, 0.12);
                  border-radius: 24px;
                  padding: 45px 35px;
                  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.5);
                }
                .branding {
                  text-align: center;
                  margin-bottom: 30px;
                }
                .logo-circle {
                  display: inline-block;
                  width: 72px;
                  height: 72px;
                  border-radius: 36px;
                  background: linear-gradient(135deg, #7C3AED 0%, #4F46E5 50%, #0EA5E9 100%);
                  line-height: 72px;
                  text-align: center;
                  font-size: 32px;
                  box-shadow: 0 8px 24px rgba(124, 58, 237, 0.45);
                  border: 2px solid rgba(255, 255, 255, 0.15);
                }
                .app-name {
                  color: #FFFFFF;
                  font-size: 28px;
                  font-weight: 800;
                  letter-spacing: -0.5px;
                  margin-top: 10px;
                }
                .tagline {
                  color: rgba(255, 255, 255, 0.5);
                  font-size: 13px;
                  font-weight: 500;
                  letter-spacing: 0.5px;
                  margin-top: 4px;
                }
                h1 {
                  color: #FFFFFF;
                  text-align: center;
                  margin: 0 0 15px 0;
                  font-size: 24px;
                  font-weight: 700;
                }
                p {
                  color: rgba(255, 255, 255, 0.8);
                  font-size: 15px;
                  line-height: 1.6;
                  margin: 0 0 15px 0;
                }
                .button-container {
                  text-align: center;
                  margin: 35px 0;
                }
                .reset-button {
                  display: inline-block;
                  background: linear-gradient(135deg, #7C3AED 0%, #4F46E5 50%, #0EA5E9 100%);
                  color: white;
                  padding: 16px 45px;
                  border-radius: 16px;
                  text-decoration: none;
                  font-weight: 700;
                  font-size: 16px;
                  box-shadow: 0 8px 24px rgba(124, 58, 237, 0.4);
                  border: 1px solid rgba(255, 255, 255, 0.1);
                  letter-spacing: 0.3px;
                }
                .info-box {
                  background: rgba(255, 255, 255, 0.03);
                  border: 1px solid rgba(255, 255, 255, 0.08);
                  border-left: 4px solid #7C3AED;
                  border-radius: 12px;
                  padding: 16px;
                  margin: 25px 0;
                }
                .info-box p {
                  margin: 0;
                }
                .divider {
                  height: 1px;
                  background: rgba(255, 255, 255, 0.1);
                  margin: 30px 0;
                }
                .footer {
                  text-align: center;
                  padding-top: 10px;
                }
                .footer p {
                  font-size: 12px;
                  color: rgba(255, 255, 255, 0.4);
                  margin: 4px 0;
                }
                .warning {
                  color: #FCA5A5;
                  font-size: 13px;
                  margin-top: 8px;
                }
                .link-code {
                  background: rgba(0, 0, 0, 0.25);
                  border: 1.5px solid rgba(255, 255, 255, 0.1);
                  padding: 10px 14px;
                  border-radius: 10px;
                  color: #A78BFA;
                  font-family: monospace;
                  font-size: 12px;
                  word-break: break-all;
                  margin-top: 8px;
                  display: block;
                }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="card">
                  <!-- Branding Section -->
                  <div class="branding">
                    <div class="logo-circle">💎</div>
                    <div class="app-name">Spendly</div>
                    <div class="tagline">Track. Split. Settle.</div>
                  </div>

                  <!-- Header -->
                  <h1>🔐 Reset Your Password</h1>

                  <!-- Main Content -->
                  <p>Hi <strong>${user.name}</strong>,</p>
                  
                  <p>We received a request to reset your password for your Spendly account. If you didn't make this request, you can safely ignore this email.</p>

                  <!-- Reset Button -->
                  <div class="button-container">
                    <a href="${resetLink}" class="reset-button">Reset Password →</a>
                  </div>

                  <!-- Or copy link -->
                  <p style="font-size: 12px; color: rgba(255, 255, 255, 0.45); text-align: center; margin-top: 20px;">
                    Or copy and paste this link in your browser:
                    <span class="link-code">${resetLink}</span>
                  </p>

                  <!-- Info Box -->
                  <div class="info-box">
                    <p>⏱️ <strong>Link expires in:</strong> 15 minutes</p>
                    <p class="warning">⚠️ This link can only be used once</p>
                  </div>

                  <!-- Security Info -->
                  <div class="info-box" style="border-left-color: #EC4899;">
                    <p>🔒 <strong>Security Tips:</strong></p>
                    <p style="margin-top: 6px; font-size: 13px;">• Never share this reset link with anyone</p>
                    <p style="font-size: 13px;">• Spendly support will never ask for your password via email</p>
                    <p style="font-size: 13px;">• If you did not trigger this request, please update your security settings immediately</p>
                  </div>

                  <div class="divider"></div>

                  <!-- Footer -->
                  <div class="footer">
                    <p>This is an automated security notification. Please do not reply directly to this email.</p>
                    <p>© 2026 Spendly App. All rights reserved.</p>
                  </div>
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
