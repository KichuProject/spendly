/**
 * Spend App Backend - Entry Point
 * Production-ready server optimized for Render hosting
 */

const mongoose = require('mongoose');
const app = require('./src/app');
const { connectDB } = require('./src/config/database');
const logger = require('./src/utils/logger');
const { initializeAllJobs, stopAllJobs } = require('./src/scheduler/cronJobs');

// Render sets the PORT dynamically. Do not hardcode or bind to localhost.
const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';

let server;

// Start server
async function startServer() {
  try {
    // 1. Establish connection to MongoDB Atlas
    await connectDB();
    logger.info('✅ MongoDB connected');

    // 2. Initialize in-app automation jobs (push notifications + Brevo keep-alive check)
    await initializeAllJobs();
    logger.info('✅ Automation scheduler initialized');

    // 3. Start Express server. Explicitly bind to '0.0.0.0' to ensure Render routing resolves correctly.
    server = app.listen(PORT, '0.0.0.0', () => {
      logger.info(`🚀 Server running on port ${PORT} (${NODE_ENV})`);
      
      // Clean, production-safe logging to avoid hardcoded localhost URLs in production environments
      if (NODE_ENV !== 'production') {
        logger.info(`📍 Local API Base URL: http://localhost:${PORT}/api`);
      } else {
        logger.info(`📍 Server publicly accessible inside Docker/Render container`);
      }
      logger.info(`🔒 Environment: ${NODE_ENV}`);
    });
  } catch (error) {
    logger.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown handler to clean up resources during restarts or scale-downs
const handleGracefulShutdown = (signal) => {
  logger.warn(`⚠️ ${signal} received. Shutting down gracefully...`);
  
  // Stop in-app scheduler cron jobs
  try {
    stopAllJobs();
  } catch (cronError) {
    logger.error('❌ Error stopping cron jobs during shutdown:', cronError);
  }

  if (server) {
    server.close(async () => {
      logger.info('✅ Express server closed');
      try {
        await mongoose.connection.close();
        logger.info('✅ MongoDB connection closed');
        process.exit(0);
      } catch (dbError) {
        logger.error('❌ Error closing MongoDB connection during shutdown:', dbError);
        process.exit(1);
      }
    });
  } else {
    process.exit(0);
  }
};

// Process signals for graceful termination
process.on('SIGTERM', () => handleGracefulShutdown('SIGTERM'));
process.on('SIGINT', () => handleGracefulShutdown('SIGINT'));

// Robust unhandled error/rejection handling
process.on('unhandledRejection', (reason, promise) => {
  // Log the rejection cleanly without crashing the container on transient errors (important for Render free tier)
  logger.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  // Uncaught exception requires immediate crash logging and termination to avoid corrupted states
  logger.error('❌ Uncaught Exception:', error);
  if (server) {
    server.close(() => process.exit(1));
  } else {
    process.exit(1);
  }
});

// Run start flow
startServer();

module.exports = app;
