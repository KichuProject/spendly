/**
 * Authentication Service
 * Handles OTP generation, verification, and token management
 */

const User = require('../models/User');
const { storeOTP, getOTP, verifyOTPInStore, deleteOTP } = require('../utils/otpStore');
const { generateOTP } = require('../utils/hashUtils');
const { generateAccessToken, generateRefreshToken } = require('../utils/tokenUtils');
const { sendOTPEmail, sendWelcomeEmail } = require('./brevoService');
const logger = require('../utils/logger');

/**
 * Send OTP to email
 */
const sendOTP = async (email, type = 'signup', phone = null) => {
  try {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new Error('Invalid email format');
    }

    const validType = type === 'signup' ? 'signup' : 'signup';

    // Check if user already exists for signup
    const userExists = await User.findByEmail(email);
    if (userExists) {
      throw new Error('Email already registered. Please login instead.');
    }

    // Check if phone number already exists and is exactly 10 digits
    if (phone && type === 'signup') {
      const trimmedPhone = phone.trim();
      if (!/^\d{10}$/.test(trimmedPhone)) {
        throw new Error('Phone number must be exactly 10 digits');
      }
      const phoneExists = await User.findOne({ phone: trimmedPhone });
      if (phoneExists) {
        throw new Error('Phone number already registered. Please login instead.');
      }
    }

    // Generate OTP
    const otp = generateOTP(6);

    // Store OTP in memory (no MongoDB)
    const otpRecord = storeOTP(email, otp, validType);

    // Send OTP via email
    const emailResult = await sendOTPEmail(email, otp);

    if (!emailResult.success) {
      logger.error(`Failed to send OTP to ${email}:`, emailResult.error);
      throw new Error('Failed to send OTP. Please try again.');
    }

    logger.info(`✅ OTP sent to ${email} for ${validType}`);

    return {
      success: true,
      message: 'OTP sent to your email',
      email,
      expiresIn: 300, // 5 minutes in seconds
    };
  } catch (error) {
    logger.error('Error in sendOTP:', error.message);
    throw error;
  }
};

/**
 * Verify OTP and create/login user
 */
const verifyOTP = async (email, otp, name = null, password = null, phone = null) => {
  try {
    const normalizedEmail = email.toLowerCase();

    // Verify OTP from memory store (only signup is supported with OTP now)
    const verifyResult = verifyOTPInStore(normalizedEmail, otp, 'signup');

    if (!verifyResult.success) {
      throw new Error(verifyResult.message);
    }

    // Create new user
    if (!name || name.trim().length < 2) {
      throw new Error('Name is required for signup');
    }

    // Ensure email is not already registered
    const emailExists = await User.findByEmail(normalizedEmail);
    if (emailExists) {
      throw new Error('Email already registered. Please login instead.');
    }

    // Check phone number uniqueness one final time and ensure it is 10 digits
    if (phone) {
      const trimmedPhone = phone.trim();
      if (!/^\d{10}$/.test(trimmedPhone)) {
        throw new Error('Phone number must be exactly 10 digits');
      }
      const phoneExists = await User.findOne({ phone: trimmedPhone });
      if (phoneExists) {
        throw new Error('Phone number already registered. Please login instead.');
      }
    }

    let user = new User({
      email: normalizedEmail,
      name: name.trim(),
      phone: phone ? phone.trim() : undefined,
      isEmailVerified: true,
    });

    await user.save();

    // If password is provided, set it
    if (password) {
      await user.setPassword(password);
    }

    // Send welcome email
    await sendWelcomeEmail(normalizedEmail, name.trim());

    logger.info(`✅ New user created: ${normalizedEmail}`);

    // Generate tokens
    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    // Delete OTP from memory
    deleteOTP(normalizedEmail);

    return {
      success: true,
      message: 'Authentication successful',
      user: user.toPublicJSON(),
      accessToken,
      refreshToken,
      expiresIn: 900, // 15 minutes in seconds
    };
  } catch (error) {
    logger.error('Error in verifyOTP:', error.message);
    throw error;
  }
};

/**
 * Login user using email and password
 */
const login = async (emailOrPhone, password) => {
  try {
    if (!emailOrPhone || !password) {
      throw new Error('Email or Phone number and password are required');
    }

    const normalized = emailOrPhone.trim().toLowerCase();

    // Find user by email or phone and select the password field
    const user = await User.findOne({
      $or: [
        { email: normalized },
        { phone: normalized },
      ],
    }).select('+password');

    if (!user) {
      throw new Error('User not found. Please sign up first.');
    }

    if (!user.password) {
      throw new Error('No password set for this account. Please use password reset to set one.');
    }

    // Verify password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw new Error('Incorrect password');
    }

    // Login successful
    user.isEmailVerified = true;
    user.lastLogin = new Date();
    user.loginStreak = (user.loginStreak || 0) + 1;
    await user.save();

    logger.info(`✅ User logged in: ${user.email}`);

    // Generate tokens
    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    return {
      success: true,
      message: 'Login successful',
      user: user.toPublicJSON(),
      accessToken,
      refreshToken,
      expiresIn: 900, // 15 minutes in seconds
    };
  } catch (error) {
    logger.error('Error in login service:', error.message);
    throw error;
  }
};

/**
 * Refresh access token
 */
const refreshAccessToken = async (refreshToken) => {
  try {
    const { verifyRefreshToken } = require('../utils/tokenUtils');

    const decoded = verifyRefreshToken(refreshToken);
    const user = await User.findById(decoded.userId);

    if (!user) {
      throw new Error('User not found');
    }

    const newAccessToken = generateAccessToken(user._id);

    logger.info(`✅ Access token refreshed for user ${user.email}`);

    return {
      success: true,
      accessToken: newAccessToken,
      expiresIn: 900, // 15 minutes
    };
  } catch (error) {
    logger.error('Error in refreshAccessToken:', error.message);
    throw error;
  }
};

/**
 * Logout user (can clear refresh tokens if stored server-side)
 */
const logout = async (userId) => {
  try {
    // Currently, since we're using stateless JWT, logout is handled client-side
    // In future, can implement token blacklist if needed
    logger.info(`✅ User ${userId} logged out`);

    return {
      success: true,
      message: 'Logged out successfully',
    };
  } catch (error) {
    logger.error('Error in logout:', error.message);
    throw error;
  }
};

/**
 * Resend OTP
 */
const resendOTP = async (email, purpose = 'signup', phone = null) => {
  try {
    return await sendOTP(email, 'signup', phone);
  } catch (error) {
    logger.error('Error in resendOTP:', error.message);
    throw error;
  }
};

module.exports = {
  sendOTP,
  verifyOTP,
  refreshAccessToken,
  logout,
  resendOTP,
  login,
};
