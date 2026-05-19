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
      <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: linear-gradient(135deg, #0F0C29 0%, #302B63 50%, #24243E 100%); min-height: 100vh;">
          <div style="max-width: 500px; margin: 40px auto; padding: 0 20px;">
            <!-- Glass Card Container -->
            <div style="background: rgba(255, 255, 255, 0.1); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 24px; padding: 40px 30px; box-shadow: 0 8px 32px rgba(31, 38, 135, 0.37);">
              
              <!-- Header -->
              <h1 style="color: #FFFFFF; text-align: center; margin: 0 0 8px 0; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">Spend App</h1>
              <p style="color: rgba(255, 255, 255, 0.7); text-align: center; margin: 0 0 30px 0; font-size: 14px;">Your OTP Verification Code</p>
              
              <!-- OTP Display -->
              <div style="text-align: center; margin: 30px 0;">
                <p style="color: rgba(255, 255, 255, 0.6); font-size: 14px; margin: 0 0 20px 0;">Your verification code:</p>
                
                <!-- OTP Box -->
                <div style="background: rgba(124, 58, 237, 0.15); border: 2px solid rgba(124, 58, 237, 0.6); border-radius: 16px; padding: 24px 16px; text-align: center;">
                  <p style="color: #FFFFFF; font-size: 38px; font-weight: 700; letter-spacing: 8px; margin: 0; font-family: 'Arial', sans-serif; line-height: 1; white-space: nowrap;">${otp}</p>
                </div>
              </div>
              
              <!-- Expiry Info -->
              <div style="background: rgba(255, 255, 255, 0.05); border-radius: 12px; padding: 16px; text-align: center; margin: 25px 0;">
                <p style="color: rgba(255, 255, 255, 0.6); font-size: 13px; margin: 0;">⏱️ This code expires in <strong style="color: #FFFFFF;">5 minutes</strong></p>
                <p style="color: rgba(255, 255, 255, 0.4); font-size: 12px; margin: 8px 0 0 0;">Don't share this code with anyone</p>
              </div>
              
              <!-- Divider -->
              <div style="height: 1px; background: rgba(255, 255, 255, 0.1); margin: 30px 0;"></div>
              
              <!-- Footer -->
              <p style="color: rgba(255, 255, 255, 0.4); font-size: 12px; text-align: center; margin: 0 0 12px 0;">
                If you didn't request this code, please ignore this email or contact support.
              </p>
              <p style="color: rgba(255, 255, 255, 0.3); font-size: 11px; text-align: center; margin: 0;">
                © 2026 Spend App. All rights reserved.
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
        subject: `Your Spend App OTP: ${otp}`,
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
      <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: linear-gradient(135deg, #0F0C29 0%, #302B63 50%, #24243E 100%); min-height: 100vh;">
          <div style="max-width: 500px; margin: 40px auto; padding: 0 20px;">
            <!-- Glass Card Container -->
            <div style="background: rgba(255, 255, 255, 0.1); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 24px; padding: 40px 30px; box-shadow: 0 8px 32px rgba(31, 38, 135, 0.37);">
              
              <!-- Header -->
              <h1 style="color: #FFFFFF; text-align: center; margin: 0 0 8px 0; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">Welcome! 🎉</h1>
              <p style="color: rgba(255, 255, 255, 0.7); text-align: center; margin: 0 0 30px 0; font-size: 14px;">To Spend App</p>
              
              <!-- Main Content -->
              <p style="color: rgba(255, 255, 255, 0.9); font-size: 16px; margin: 0 0 20px 0;">Hi <strong style="color: #FFFFFF;">${userName}</strong>,</p>
              
              <p style="color: rgba(255, 255, 255, 0.8); font-size: 15px; line-height: 1.6; margin: 0 0 25px 0;">
                Welcome to Spend App — Your personal expense tracking companion! Track every rupee, analyze your spending patterns, and manage your finances effortlessly.
              </p>
              
              <!-- Features Grid -->
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin: 30px 0;">
                <div style="background: rgba(124, 58, 237, 0.15); border: 1px solid rgba(124, 58, 237, 0.4); border-radius: 12px; padding: 16px; text-align: center;">
                  <div style="font-size: 24px; margin-bottom: 8px;">📊</div>
                  <p style="color: rgba(255, 255, 255, 0.8); font-size: 12px; margin: 0; font-weight: 600;">Track Expenses</p>
                  <p style="color: rgba(255, 255, 255, 0.5); font-size: 11px; margin: 4px 0 0 0;">Daily & weekly</p>
                </div>
                <div style="background: rgba(124, 58, 237, 0.15); border: 1px solid rgba(124, 58, 237, 0.4); border-radius: 12px; padding: 16px; text-align: center;">
                  <div style="font-size: 24px; margin-bottom: 8px;">👥</div>
                  <p style="color: rgba(255, 255, 255, 0.8); font-size: 12px; margin: 0; font-weight: 600;">Split Bills</p>
                  <p style="color: rgba(255, 255, 255, 0.5); font-size: 11px; margin: 4px 0 0 0;">With friends</p>
                </div>
                <div style="background: rgba(124, 58, 237, 0.15); border: 1px solid rgba(124, 58, 237, 0.4); border-radius: 12px; padding: 16px; text-align: center;">
                  <div style="font-size: 24px; margin-bottom: 8px;">📈</div>
                  <p style="color: rgba(255, 255, 255, 0.8); font-size: 12px; margin: 0; font-weight: 600;">Analytics</p>
                  <p style="color: rgba(255, 255, 255, 0.5); font-size: 11px; margin: 4px 0 0 0;">Insights & trends</p>
                </div>
                <div style="background: rgba(124, 58, 237, 0.15); border: 1px solid rgba(124, 58, 237, 0.4); border-radius: 12px; padding: 16px; text-align: center;">
                  <div style="font-size: 24px; margin-bottom: 8px;">🔔</div>
                  <p style="color: rgba(255, 255, 255, 0.8); font-size: 12px; margin: 0; font-weight: 600;">Reminders</p>
                  <p style="color: rgba(255, 255, 255, 0.5); font-size: 11px; margin: 4px 0 0 0;">Never forget</p>
                </div>
              </div>
              
              <!-- CTA Section -->
              <div style="background: linear-gradient(135deg, rgba(124, 58, 237, 0.3) 0%, rgba(79, 70, 229, 0.2) 100%); border: 1px solid rgba(124, 58, 237, 0.5); border-radius: 12px; padding: 20px; text-align: center; margin: 30px 0;">
                <p style="color: rgba(255, 255, 255, 0.8); font-size: 14px; margin: 0; font-weight: 600;">You're all set! 🚀</p>
                <p style="color: rgba(255, 255, 255, 0.6); font-size: 13px; margin: 8px 0 0 0;">Start tracking your expenses now</p>
              </div>
              
              <!-- Divider -->
              <div style="height: 1px; background: rgba(255, 255, 255, 0.1); margin: 30px 0;"></div>
              
              <!-- Footer -->
              <p style="color: rgba(255, 255, 255, 0.4); font-size: 12px; text-align: center; margin: 0 0 12px 0;">
                Need help? Check out our support or documentation.
              </p>
              <p style="color: rgba(255, 255, 255, 0.3); font-size: 11px; text-align: center; margin: 0;">
                © 2026 Spend App. All rights reserved.
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
        subject: `Welcome to Spend App, ${userName}!`,
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
 * Called monthly to keep Brevo API active
 * Prevents Brevo from deactivating account after ~3 months of no usage
 * @returns {object} - Success status
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
          <style>
            body {
              margin: 0;
              padding: 0;
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              background: linear-gradient(135deg, #0F0C29 0%, #302B63 50%, #24243E 100%);
              min-height: 100vh;
            }
            .container {
              max-width: 600px;
              margin: 40px auto;
              padding: 0 20px;
            }
            .card {
              background: rgba(255, 255, 255, 0.1);
              backdrop-filter: blur(20px);
              -webkit-backdrop-filter: blur(20px);
              border: 1px solid rgba(255, 255, 255, 0.2);
              border-radius: 24px;
              padding: 40px 30px;
              box-shadow: 0 8px 32px rgba(31, 38, 135, 0.37);
            }
            h1 {
              color: #FFFFFF;
              text-align: center;
              margin: 0 0 20px 0;
              font-size: 28px;
              font-weight: 700;
            }
            p {
              color: rgba(255, 255, 255, 0.8);
              font-size: 15px;
              line-height: 1.6;
              margin: 0 0 15px 0;
            }
            .timestamp {
              color: rgba(255, 255, 255, 0.5);
              font-size: 12px;
              text-align: center;
              margin-top: 30px;
              padding-top: 20px;
              border-top: 1px solid rgba(255, 255, 255, 0.1);
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="card">
              <h1>✅ Brevo Keep-Alive Email</h1>
              <p>This is an automated monthly email to keep the Brevo API active for the Spend App backend.</p>
              <p>This email ensures that the email service continues to function properly and prevents account deactivation due to inactivity.</p>
              <p><strong>Next scheduled keep-alive:</strong> 30 days from now</p>
              <div class="timestamp">
                Generated on: ${new Date().toISOString()}
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
