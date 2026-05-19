/**
 * Spend App Backend - Entry Point
 * Production-ready server with:
 * - MongoDB Atlas via Mongoose
 * - JWT Authentication
 * - Brevo (Sendinblue) for OTP emails
 * - Expo Push Notifications
 * - Automated Scheduler (push notifications & keep-alive)
 */

const app = require('./src/app');
const { connectDB } = require('./src/config/database');
const logger = require('./src/utils/logger');
const { initializeAllJobs, stopAllJobs } = require('./src/scheduler/cronJobs');

const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';

let server;

// Start server
async function startServer() {
  try {
    // Connect to MongoDB
    await connectDB();
    logger.info('✅ MongoDB connected');

    // Initialize all automation jobs (push notifications + keep-alive)
    await initializeAllJobs();
    logger.info('✅ Automation scheduler initialized');

    // Start Express server
    server = app.listen(PORT, () => {
      logger.info(`🚀 Server running on port ${PORT} (${NODE_ENV})`);
      logger.info(`📍 API Base URL: http://localhost:${PORT}/api`);
      logger.info(`🔒 Environment: ${NODE_ENV}`);
    });
  } catch (error) {
    logger.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.warn('⚠️ SIGTERM received. Shutting down gracefully...');
  stopAllJobs();
  if (server) {
    server.close(() => {
      logger.info('✅ Server closed');
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
});

process.on('SIGINT', () => {
  logger.warn('⚠️ SIGINT received. Shutting down gracefully...');
  stopAllJobs();
  if (server) {
    server.close(() => {
      logger.info('✅ Server closed');
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
});

// Unhandled rejection
process.on('unhandledRejection', (reason, promise) => {
  logger.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Start the server
startServer();

module.exports = app;
