/**
 * Authentication Middleware
 * JWT verification and user extraction
 */

const { verifyAccessToken } = require('../utils/tokenUtils');
const logger = require('../utils/logger');

/**
 * Verify JWT Token and extract userId
 */
const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Authorization header missing or invalid',
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    try {
      const decoded = verifyAccessToken(token);
      req.userId = decoded.userId;
      req.user = { id: decoded.userId, userId: decoded.userId };
      next();
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          message: 'Access token expired',
          code: 'TOKEN_EXPIRED',
        });
      }

      return res.status(401).json({
        success: false,
        message: 'Invalid access token',
      });
    }
  } catch (error) {
    logger.error('Auth middleware error:', error);
    return res.status(500).json({
      success: false,
      message: 'Authentication error',
    });
  }
};

/**
 * Optional authentication - doesn't fail if no token
 */
const optionalAuthMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);

      try {
        const decoded = verifyAccessToken(token);
        req.userId = decoded.userId;
        req.user = { id: decoded.userId, userId: decoded.userId };
      } catch (error) {
        logger.warn('Optional auth failed, continuing without auth:', error.message);
      }
    }

    next();
  } catch (error) {
    logger.error('Optional auth middleware error:', error);
    next();
  }
};

module.exports = {
  authMiddleware,
  optionalAuthMiddleware,
};
