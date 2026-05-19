/**
 * In-Memory OTP Storage
 * Stores OTP temporarily for email verification without MongoDB
 */

const otpMap = new Map();

/**
 * Store OTP in memory with expiration
 */
const storeOTP = (email, otp, purpose = 'login') => {
  const normalizedEmail = email.toLowerCase();
  const expiresAt = new Date(Date.now() + 300 * 1000); // 5 minutes (300 seconds)

  otpMap.set(normalizedEmail, {
    otp,
    purpose,
    expiresAt,
    attempts: 0,
    maxAttempts: 5,
    verified: false,
  });

  return { email: normalizedEmail, expiresAt };
};

/**
 * Get OTP from memory
 */
const getOTP = (email, purpose = 'login') => {
  const normalizedEmail = email.toLowerCase();
  const otpData = otpMap.get(normalizedEmail);

  if (!otpData || otpData.purpose !== purpose) {
    return null;
  }

  // Check if expired
  if (new Date() > otpData.expiresAt) {
    otpMap.delete(normalizedEmail);
    return null;
  }

  return otpData;
};

/**
 * Verify OTP and check attempts
 */
const verifyOTP = (email, inputOTP, purpose = 'login') => {
  const otpData = getOTP(email, purpose);

  if (!otpData) {
    return { success: false, message: 'OTP expired or not found' };
  }

  if (otpData.attempts >= otpData.maxAttempts) {
    otpMap.delete(email.toLowerCase());
    return { success: false, message: 'Maximum OTP attempts exceeded' };
  }

  if (otpData.otp !== inputOTP) {
    otpData.attempts += 1;
    return { success: false, message: 'Invalid OTP' };
  }

  otpData.verified = true;
  return { success: true, data: otpData };
};

/**
 * Delete OTP from memory
 */
const deleteOTP = (email) => {
  otpMap.delete(email.toLowerCase());
};

/**
 * Clean up expired OTPs (run periodically)
 */
const cleanupExpiredOTPs = () => {
  const now = new Date();
  for (const [email, otpData] of otpMap.entries()) {
    if (now > otpData.expiresAt) {
      otpMap.delete(email);
    }
  }
};

// Run cleanup every 5 minutes
setInterval(cleanupExpiredOTPs, 5 * 60 * 1000);

module.exports = {
  storeOTP,
  getOTP,
  verifyOTPInStore: verifyOTP,
  deleteOTP,
  cleanupExpiredOTPs,
};
