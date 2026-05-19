/**
 * Hash Utilities
 * Encryption and decryption for passwords (reversible)
 */

const crypto = require('crypto');
const logger = require('./logger');

// Encryption key - should be 32 characters for AES-256
const ENCRYPTION_KEY = (process.env.ENCRYPTION_KEY || 'spend_app_secret_key_1234567890ab').substring(0, 32);

/**
 * Encrypt a password string
 * Returns encrypted password that can be decrypted
 */
const encryptPassword = (password) => {
  try {
    // Generate a random IV
    const iv = crypto.randomBytes(16);
    
    // Create cipher with AES-256-CBC
    const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
    
    let encrypted = cipher.update(password, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    // Prepend IV to encrypted password (IV + encrypted)
    return iv.toString('hex') + ':' + encrypted;
  } catch (error) {
    logger.error('Failed to encrypt password:', error);
    throw error;
  }
};

/**
 * Decrypt a password string
 * Returns the original password
 */
const decryptPassword = (encryptedPassword) => {
  try {
    // Split IV and encrypted password
    const parts = encryptedPassword.split(':');
    const iv = Buffer.from(parts[0], 'hex');
    const encrypted = parts[1];
    
    // Create decipher
    const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    logger.error('Failed to decrypt password:', error);
    throw error;
  }
};

/**
 * Hash a string (for other uses - not passwords)
 * Kept for backwards compatibility
 */
const hashString = async (str) => {
  try {
    return crypto.createHash('sha256').update(str).digest('hex');
  } catch (error) {
    logger.error('Failed to hash string:', error);
    throw error;
  }
};

/**
 * Compare string with hash (for other uses)
 * Kept for backwards compatibility
 */
const compareHash = async (str, hash) => {
  try {
    const newHash = crypto.createHash('sha256').update(str).digest('hex');
    return newHash === hash;
  } catch (error) {
    logger.error('Failed to compare hash:', error);
    throw error;
  }
};

/**
 * Generate random OTP
 */
const generateOTP = (length = 6) => {
  const digits = '0123456789';
  let otp = '';
  for (let i = 0; i < length; i++) {
    otp += digits[Math.floor(Math.random() * 10)];
  }
  return otp;
};

/**
 * Generate random string
 */
const generateRandomString = (length = 32) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

module.exports = {
  hashString,
  compareHash,
  encryptPassword,
  decryptPassword,
  generateOTP,
  generateRandomString,
};
