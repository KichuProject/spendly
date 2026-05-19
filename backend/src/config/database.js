/**
 * MongoDB Connection Setup
 * Connects to MongoDB Atlas using Mongoose
 */

const mongoose = require('mongoose');
const dns = require('dns');
// Set custom DNS to bypass SRV resolution issues in Node.js
dns.setServers(['8.8.8.8', '8.8.4.4']);

const logger = require('../utils/logger');

let isConnected = false;

const connectDB = async () => {
  if (isConnected) {
    logger.info('Using existing MongoDB connection');
    return;
  }

  try {
    const uri = process.env.MONGODB_URI;

    if (!uri) {
      throw new Error('MONGODB_URI is not defined in environment variables');
    }

    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: 10,
      socketTimeoutMS: 45000,
    });

    isConnected = true;

    logger.info('✅ MongoDB Atlas connected successfully');

    // Handle connection events
    mongoose.connection.on('disconnected', () => {
      isConnected = false;
      logger.warn('⚠️ MongoDB disconnected');
    });

    mongoose.connection.on('error', (error) => {
      logger.error('❌ MongoDB connection error:', error);
    });

    return mongoose.connection;
  } catch (error) {
    logger.error('❌ MongoDB connection failed:', error.message);
    throw error;
  }
};

const disconnectDB = async () => {
  try {
    if (isConnected) {
      await mongoose.disconnect();
      isConnected = false;
      logger.info('✅ MongoDB disconnected');
    }
  } catch (error) {
    logger.error('❌ Failed to disconnect MongoDB:', error.message);
    throw error;
  }
};

module.exports = {
  connectDB,
  disconnectDB,
  isConnected: () => isConnected,
};
