/**
 * Environment Variables Validation
 */

require('dotenv').config();

const requiredEnvVars = [
  'MONGODB_URI',
  'JWT_SECRET',
  'JWT_REFRESH_SECRET',
  'BREVO_API_KEY',
  'BREVO_SENDER_EMAIL',
];

const validateEnv = () => {
  const missing = [];

  requiredEnvVars.forEach((envVar) => {
    if (!process.env[envVar]) {
      missing.push(envVar);
    }
  });

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}`
    );
  }
};

module.exports = {
  validateEnv,
};
