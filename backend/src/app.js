/**
 * Express App Setup
 * Middleware configuration and route initialization
 */

const path = require('path');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const errorHandler = require('./middlewares/errorHandler');
const logger = require('./utils/logger');

// Routes
const authRoutes = require('./routes/authRoutes');
const expenseRoutes = require('./routes/expenseRoutes');
const friendRoutes = require('./routes/friendRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const dayRoutes = require('./routes/dayRoutes');
const userRoutes = require('./routes/userRoutes');
const testRoutes = require('./routes/testRoutes');
const versionRoutes = require('./routes/versionRoutes');

const app = express();

// Security middleware
app.use(
  helmet({
    contentSecurityPolicy: false,
  })
);

// CORS configuration
app.use(
  cors({
    origin: (origin, callback) => {
      const allowedOrigins = [
        'http://localhost:3000',
        'http://localhost:19006',
        'http://localhost:5000',
        'http://localhost:5500',
        'http://127.0.0.1:5000',
        'http://127.0.0.1:5500',
      ];
      
      // Check if origin is allowed
      if (!origin || allowedOrigins.includes(origin) || origin.startsWith('chrome-extension://')) {
        return callback(null, true);
      }
      
      const envUrl = process.env.FRONTEND_URL;
      if (envUrl && origin === envUrl) {
        return callback(null, true);
      }
      
      callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Body parser middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`);
  next();
});

// Serve static files for password resets (handles both local self-contained folder and external folder for Render compatibility)
const fs = require('fs');
const localResetPath = path.join(__dirname, '../spendreset');
const externalResetPath = path.join(__dirname, '../../spendreset');
const resetPath = fs.existsSync(path.join(localResetPath, 'reset.html')) ? localResetPath : externalResetPath;

// Serve reset.html explicitly for the clean /spendreset route (without reset.html in the URL)
app.get('/spendreset', (req, res) => {
  res.sendFile(path.join(resetPath, 'reset.html'));
});

// Serve static files from the resolved spendreset directory
app.use('/spendreset', express.static(resetPath));

// Serve general static files from the public folder (index.html, assets, etc.)
app.use(express.static(path.join(__dirname, '../public')));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/friends', friendRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/days', dayRoutes);
app.use('/api/users', userRoutes);
// Only enable seed/test endpoints in development environments
if (process.env.NODE_ENV !== 'production') {
  app.use('/api/test', testRoutes);
}
app.use('/api/version', versionRoutes);

// Welcome route
app.get('/api', (req, res) => {
  res.json({
    message: 'Welcome to Spend App Backend API',
    version: '1.0.0',
    documentation: 'Check docs for endpoint information',
    endpoints: {
      auth: '/api/auth',
      expenses: '/api/expenses',
      friends: '/api/friends',
      analytics: '/api/analytics',
      days: '/api/days',
      users: '/api/users',
    },
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
});

// Error handling middleware (must be last)
app.use(errorHandler);

module.exports = app;
