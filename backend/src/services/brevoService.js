/**
 * Brevo Email Service
 * Sends emails via Brevo (Sendinblue) SMTP API
 * Includes OTP, welcome emails, and keep-alive functionality
 */

const axios = require('axios');
const logger = require('../utils/logger');

const BREVO_API_URL = 'https://api.brevo.com/v3';
const BREVO_API_KEY = process.env.BREVO_API_KEY;
const SENDER_EMAIL = process.env.BREVO_SENDER_EMAIL || 'noreply@spendapp.com';
const SENDER_NAME = 'Spend App';

const BREVO_TIMEOUT = 10000; // 10 seconds

/**
 * Generic email sending function
 * @param {object} options - Email configuration
 * @param {string} options.to - Recipient email address
 * @param {string} options.subject - Email subject
 * @param {string} options.htmlContent - HTML email body
 * @param {string} options.textContent - Plain text email body (optional)
 * @param {object} options.replyTo - Reply-to address (optional)
 * @returns {object} - Success status and message ID
 */
const sendEmail = async (options) => {
  try {
    if (!BREVO_API_KEY) {
      throw new Error('BREVO_API_KEY is not configured');
    }

    const { to, subject, htmlContent, textContent, replyTo } = options;

    if (!to || !subject || !htmlContent) {
      throw new Error('Missing required fields: to, subject, htmlContent');
    }

    const payload = {
      sender: {
        name: SENDER_NAME,
        email: SENDER_EMAIL,
      },
      to: [
        {
          email: to,
          name: to.split('@')[0], // Use email prefix as name if not provided
        },
      ],
      subject,
      htmlContent,
      textContent,
    };

    if (replyTo) {
      payload.replyTo = replyTo;
    }

    const response = await axios.post(`${BREVO_API_URL}/smtp/email`, payload, {
      headers: {
        'api-key': BREVO_API_KEY,
        'Content-Type': 'application/json',
      },
      timeout: BREVO_TIMEOUT,
    });

    logger.info(`✅ Email sent to ${to} - Subject: ${subject}`);

    return {
      success: true,
      messageId: response.data.messageId,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    logger.error('❌ Failed to send email:', {
      to: options.to,
      subject: options.subject,
      error: error.response?.data?.message || error.message,
    });

    return {
      success: false,
      error: error.response?.data?.message || error.message,
      timestamp: new Date().toISOString(),
    };
  }
};

/**
 * Send OTP via email
 */
const sendOTPEmail = async (recipientEmail, otp, userName = 'User') => {
  try {
    if (!BREVO_API_KEY) {
      throw new Error('BREVO_API_KEY is not configured');
    }

    const emailContent = `
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
                <div style="display: inline-block; width: 56px; height: 56px; border-radius: 16px; background: linear-gradient(135deg, #059669 0%, #0EA5E9 50%, #6366F1 100%); line-height: 56px; font-size: 26px; color: #FFFFFF; box-shadow: 0 0 30px rgba(14, 165, 233, 0.4);">⚡</div>
                <h1 style="color: #FFFFFF; margin: 14px 0 4px 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">Spendly</h1>
                <span style="font-size: 11px; font-weight: 700; background: linear-gradient(135deg, #059669 0%, #0EA5E9 100%); color: #FFFFFF; padding: 3px 10px; border-radius: 20px; letter-spacing: 0.5px; text-transform: uppercase;">v3.0.0 Security Verification</span>
              </div>
              
              <p style="color: #A1A1AA; font-size: 14px; text-align: center; line-height: 1.5; margin: 0 0 28px 0;">
                Hi <strong style="color: #FFFFFF;">${userName}</strong>, here is your 6-digit verification code to complete your login or registration:
              </p>
              
              <!-- OTP Box -->
              <div style="background: linear-gradient(135deg, rgba(5, 150, 105, 0.12) 0%, rgba(14, 165, 233, 0.18) 50%, rgba(99, 102, 241, 0.12) 100%); border: 1.5px solid rgba(14, 165, 233, 0.4); border-radius: 20px; padding: 26px 16px; text-align: center; margin-bottom: 24px;">
                <div style="color: #A1A1AA; font-size: 11px; text-transform: uppercase; font-weight: 700; letter-spacing: 1px; margin-bottom: 8px;">Your One-Time Passcode</div>
                <div style="color: #FFFFFF; font-size: 42px; font-weight: 800; letter-spacing: 10px; font-family: 'Courier New', monospace; line-height: 1;">${otp}</div>
              </div>
              
              <!-- Expiry Alert Pill -->
              <div style="background: rgba(255, 255, 255, 0.04); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 14px; padding: 14px; text-align: center; margin-bottom: 28px;">
                <p style="color: #A1A1AA; font-size: 13px; margin: 0;">⏱️ Code expires in <strong style="color: #10B981;">5 minutes</strong>. Never share this code with anyone.</p>
              </div>
              
              <!-- Divider -->
              <div style="height: 1px; background: rgba(255, 255, 255, 0.08); margin-bottom: 24px;"></div>
              
              <!-- Footer -->
              <p style="color: #71717A; font-size: 12px; text-align: center; margin: 0 0 8px 0; line-height: 1.5;">
                If you didn't request this code, you can safely ignore this email.
              </p>
              <p style="color: #52525B; font-size: 11px; text-align: center; margin: 0;">
                © 2026 Spendly Inc. End-to-End Encrypted Security.
              </p>
              
            </div>
          </div>
        </body>
      </html>
    `;

    const response = await axios.post(
      `${BREVO_API_URL}/smtp/email`,
      {
        sender: {
          name: SENDER_NAME,
          email: SENDER_EMAIL,
        },
        to: [
          {
            email: recipientEmail,
            name: userName,
          },
        ],
        subject: `Your Spendly Security Code: ${otp}`,
        htmlContent: emailContent,
      },
      {
        headers: {
          'api-key': BREVO_API_KEY,
          'Content-Type': 'application/json',
        },
      }
    );

    logger.info(`✅ OTP email sent to ${recipientEmail}`);
    return {
      success: true,
      messageId: response.data.messageId,
    };
  } catch (error) {
    logger.error('❌ Failed to send OTP email:', error.response?.data || error.message);

    return {
      success: false,
      error: error.response?.data?.message || error.message,
    };
  }
};

/**
 * Send welcome email
 */
const sendWelcomeEmail = async (userEmail, userName) => {
  try {
    const emailContent = `
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
              
              <!-- Header -->
              <div style="text-align: center; margin-bottom: 28px;">
                <div style="display: inline-block; width: 60px; height: 60px; border-radius: 20px; background: linear-gradient(135deg, #059669 0%, #0EA5E9 50%, #6366F1 100%); line-height: 60px; font-size: 28px; color: #FFFFFF; box-shadow: 0 0 35px rgba(14, 165, 233, 0.4);">🎉</div>
                <h1 style="color: #FFFFFF; margin: 16px 0 4px 0; font-size: 26px; font-weight: 800; letter-spacing: -0.5px;">Welcome to Spendly!</h1>
                <p style="color: #A1A1AA; font-size: 14px; margin: 0;">Next-Gen Voice Personal Finance & Analytics</p>
              </div>
              
              <p style="color: #E4E4E7; font-size: 15px; line-height: 1.6; margin: 0 0 24px 0;">
                Hi <strong style="color: #FFFFFF;">${userName}</strong>, welcome aboard! Spendly helps you master your money with natural voice entry, group bill splitting, and visual analytics.
              </p>
              
              <!-- 4 Feature Cards Grid -->
              <div style="display: table; width: 100%; border-collapse: separate; border-spacing: 10px; margin-bottom: 28px;">
                <div style="display: table-row;">
                  <div style="display: table-cell; width: 50%; background: #121218; border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 16px; padding: 16px; vertical-align: top;">
                    <div style="font-size: 22px; margin-bottom: 6px;">🎙️</div>
                    <div style="color: #FFFFFF; font-size: 13px; font-weight: 700; margin-bottom: 4px;">Voice Entry</div>
                    <div style="color: #71717A; font-size: 11px; line-height: 1.4;">English & Tamil speech parsing</div>
                  </div>
                  <div style="display: table-cell; width: 50%; background: #121218; border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 16px; padding: 16px; vertical-align: top;">
                    <div style="font-size: 22px; margin-bottom: 6px;">👥</div>
                    <div style="color: #FFFFFF; font-size: 13px; font-weight: 700; margin-bottom: 4px;">Group Splits</div>
                    <div style="color: #71717A; font-size: 11px; line-height: 1.4;">Split bills & settle via UPI</div>
                  </div>
                </div>
                <div style="display: table-row;">
                  <div style="display: table-cell; width: 50%; background: #121218; border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 16px; padding: 16px; vertical-align: top;">
                    <div style="font-size: 22px; margin-bottom: 6px;">📊</div>
                    <div style="color: #FFFFFF; font-size: 13px; font-weight: 700; margin-bottom: 4px;">Visual Insights</div>
                    <div style="color: #71717A; font-size: 11px; line-height: 1.4;">Monthly spending breakdown</div>
                  </div>
                  <div style="display: table-cell; width: 50%; background: #121218; border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 16px; padding: 16px; vertical-align: top;">
                    <div style="font-size: 22px; margin-bottom: 6px;">⚡</div>
                    <div style="color: #FFFFFF; font-size: 13px; font-weight: 700; margin-bottom: 4px;">Daily Streaks</div>
                    <div style="color: #71717A; font-size: 11px; line-height: 1.4;">Stay consistent & track progress</div>
                  </div>
                </div>
              </div>
              
              <!-- CTA Button -->
              <div style="text-align: center; margin-bottom: 28px;">
                <a href="http://localhost:5000/app.html" style="display: inline-block; background: linear-gradient(135deg, #059669 0%, #0EA5E9 50%, #6366F1 100%); color: #FFFFFF; text-decoration: none; padding: 14px 32px; border-radius: 16px; font-weight: 700; font-size: 14px; box-shadow: 0 0 30px rgba(14, 165, 233, 0.35);">
                  Launch Spendly Application →
                </a>
              </div>
              
              <!-- Divider -->
              <div style="height: 1px; background: rgba(255, 255, 255, 0.08); margin-bottom: 24px;"></div>
              
              <!-- Footer -->
              <p style="color: #71717A; font-size: 12px; text-align: center; margin: 0 0 6px 0;">
                Have questions or feedback? Reply directly to this email.
              </p>
              <p style="color: #52525B; font-size: 11px; text-align: center; margin: 0;">
                © 2026 Spendly Inc. All rights reserved.
              </p>
              
            </div>
          </div>
        </body>
      </html>
    `;

    const response = await axios.post(
      `${BREVO_API_URL}/smtp/email`,
      {
        sender: {
          name: SENDER_NAME,
          email: SENDER_EMAIL,
        },
        to: [
          {
            email: userEmail,
            name: userName,
          },
        ],
        subject: `Welcome to Spendly, ${userName}! 🎉`,
        htmlContent: emailContent,
      },
      {
        headers: {
          'api-key': BREVO_API_KEY,
          'Content-Type': 'application/json',
        },
      }
    );

    logger.info(`✅ Welcome email sent to ${userEmail}`);
    return {
      success: true,
      messageId: response.data.messageId,
    };
  } catch (error) {
    logger.error('❌ Failed to send welcome email:', error.response?.data || error.message);

    return {
      success: false,
      error: error.response?.data?.message || error.message,
    };
  }
};

/**
 * Send Brevo keep-alive email
 */
const sendBrevoKeepAliveEmail = async () => {
  try {
    if (!BREVO_API_KEY) {
      throw new Error('BREVO_API_KEY is not configured');
    }

    logger.info('🔄 Starting Brevo keep-alive email job...');

    const keepAliveContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #000000; color: #FFFFFF; min-height: 100vh;">
          <div style="max-width: 520px; margin: 40px auto; padding: 0 20px;">
            <div style="background: #0A0A0E; border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 24px; padding: 36px 28px; text-align: center;">
              <div style="display: inline-block; width: 48px; height: 48px; border-radius: 14px; background: rgba(16, 185, 129, 0.15); color: #10B981; line-height: 48px; font-size: 22px; margin-bottom: 16px;">✅</div>
              <h1 style="color: #FFFFFF; font-size: 22px; font-weight: 800; margin: 0 0 10px 0;">Spendly Backend Keep-Alive</h1>
              <p style="color: #A1A1AA; font-size: 13px; line-height: 1.5; margin-bottom: 20px;">Automated monthly diagnostic check ensuring Brevo API status remains active for production notifications.</p>
              <div style="background: #121218; border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 12px; padding: 14px; font-family: monospace; font-size: 11px; color: #10B981;">
                Status: Active • Timestamp: ${new Date().toISOString()}
              </div>
            </div>
          </div>
        </body>
      </html>
    `;

    const result = await sendEmail({
      to: SENDER_EMAIL,
      subject: '🔄 Spend App - Brevo Keep-Alive Email',
      htmlContent: keepAliveContent,
      textContent: 'This is an automated keep-alive email for the Spend App Brevo API.',
    });

    if (result.success) {
      logger.info('✅ Brevo keep-alive email sent successfully');
      logger.info(`📧 Sent to: ${SENDER_EMAIL}`);
      logger.info(`📨 Message ID: ${result.messageId}`);
      return {
        success: true,
        message: 'Keep-alive email sent successfully',
        messageId: result.messageId,
        timestamp: result.timestamp,
      };
    } else {
      logger.error('❌ Brevo keep-alive email failed:', result.error);
      return {
        success: false,
        message: 'Failed to send keep-alive email',
        error: result.error,
        timestamp: result.timestamp,
      };
    }
  } catch (error) {
    logger.error('❌ Error in Brevo keep-alive job:', error);
    return {
      success: false,
      message: 'Keep-alive job error',
      error: error.message,
      timestamp: new Date().toISOString(),
    };
  }
};

module.exports = {
  sendEmail,
  sendOTPEmail,
  sendWelcomeEmail,
  sendBrevoKeepAliveEmail,
};
