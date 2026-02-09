/**
 * Authentication Middleware
 * 
 * Middleware for protecting routes that require authentication.
 * Verifies JWT token from Authorization header and attaches user to request.
 * 
 * Usage in protected routes:
 * router.get('/protected-endpoint', authenticateToken, controller);
 */

import { verifyToken } from '../utils/jwt.js';

/**
 * Verify JWT token from Authorization header
 * 
 * Expected header format: Authorization: Bearer <token>
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {void} Calls next() if token is valid, sends error response if invalid
 */
export const authenticateToken = (req, res, next) => {
  try {
    // Get Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: 'Authorization header is missing',
      });
    }

    // Extract token from "Bearer <token>" format
    const token = authHeader.startsWith('Bearer ')
      ? authHeader.slice(7)
      : authHeader;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Token is missing',
      });
    }

    // Verify token
    const decoded = verifyToken(token);

    // Attach user data to request for use in route handlers
    req.user = decoded;

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * Optional: Verify token but don't require it (for public endpoints with optional auth)
 * Sets req.user to null if no valid token
 */
export const optionalAuth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.slice(7);
      const decoded = verifyToken(token);
      req.user = decoded;
    } else {
      req.user = null;
    }

    next();
  } catch (error) {
    // No token or invalid token, continue as public request
    req.user = null;
    next();
  }
};
