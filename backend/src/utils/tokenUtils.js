/**
 * Token Utilities
 * JWT token creation and verification
 */

const jwt = require('jsonwebtoken');
const logger = require('./logger');

/**
 * Generate Access Token (15 minutes)
 */
const generateAccessToken = (userId) => {
  try {
    const token = jwt.sign(
      { userId, type: 'access' },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRY || '15m' }
    );
    return token;
  } catch (error) {
    logger.error('Failed to generate access token:', error);
    throw error;
  }
};

/**
 * Generate Refresh Token (10 days)
 */
const generateRefreshToken = (userId) => {
  try {
    const token = jwt.sign(
      { userId, type: 'refresh' },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: process.env.JWT_REFRESH_EXPIRY || '10d' }
    );
    return token;
  } catch (error) {
    logger.error('Failed to generate refresh token:', error);
    throw error;
  }
};

/**
 * Verify Access Token
 */
const verifyAccessToken = (token) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded;
  } catch (error) {
    logger.warn('Access token verification failed:', error.message);
    throw error;
  }
};

/**
 * Verify Refresh Token
 */
const verifyRefreshToken = (token) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    return decoded;
  } catch (error) {
    logger.warn('Refresh token verification failed:', error.message);
    throw error;
  }
};

/**
 * Decode token without verification
 */
const decodeToken = (token) => {
  try {
    return jwt.decode(token);
  } catch (error) {
    logger.error('Failed to decode token:', error);
    return null;
  }
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  decodeToken,
};
