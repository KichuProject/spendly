/**
 * Logger Utility
 * Simple logging with timestamps and levels
 */

const fs = require('fs');
const path = require('path');

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

const logFile = path.join(logsDir, 'app.log');
const errorFile = path.join(logsDir, 'error.log');

const getTimestamp = () => new Date().toISOString();

const writeToFile = (file, message) => {
  try {
    fs.appendFileSync(file, `${getTimestamp()} ${message}\n`);
  } catch (error) {
    console.error('Failed to write log:', error);
  }
};

const logger = {
  info: (message, data = '') => {
    const logMessage = `[INFO] ${message} ${data}`;
    console.log(`✅ ${logMessage}`);
    writeToFile(logFile, logMessage);
  },

  warn: (message, data = '') => {
    const logMessage = `[WARN] ${message} ${data}`;
    console.warn(`⚠️ ${logMessage}`);
    writeToFile(logFile, logMessage);
  },

  error: (message, error = '') => {
    const errorMsg = error instanceof Error ? error.message : error;
    const logMessage = `[ERROR] ${message} ${errorMsg}`;
    console.error(`❌ ${logMessage}`);
    writeToFile(errorFile, logMessage);
  },

  debug: (message, data = '') => {
    if (process.env.NODE_ENV === 'development') {
      const logMessage = `[DEBUG] ${message} ${JSON.stringify(data)}`;
      console.log(`🔍 ${logMessage}`);
      writeToFile(logFile, logMessage);
    }
  },
};

module.exports = logger;
