const logger = require('../utils/logger');

/**
 * Global error handler middleware with structured error responses
 */
const errorHandler = (err, req, res, next) => {
  logger.error('Unhandled error', {
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    body: req.body
  });

  // Default error status code
  const statusCode = err.statusCode || err.status || 500;
  
  // Map error codes to user-friendly messages
  const userMessages = {
    'INVALID_INPUT': 'Please check the required fields and try again.',
    'AMOUNT_MISMATCH': 'The invoice total doesn\'t match the line items. Please verify your calculations.',
    'UNAUTHORIZED': 'You don\'t have permission to perform this action.',
    'NOT_FOUND': 'The requested resource was not found.',
    'TOO_MANY_REQUESTS': 'You\'re sending requests too quickly. Please wait a moment and try again.'
  };

  // Send structured error response
  res.status(statusCode).json({
    error: {
      code: err.code || 'INTERNAL_SERVER_ERROR',
      message: err.message || 'Internal server error',
      userMessage: err.userMessage || userMessages[err.code] || 'Something went wrong. Please try again or contact support.',
      details: err.details || null
    },
    ...(process.env.NODE_ENV === 'development' && {
      stack: err.stack
    })
  });
};

/**
 * 404 Not Found handler
 */
const notFoundHandler = (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Resource not found',
    path: req.originalUrl
  });
};

/**
 * Async error wrapper to catch async errors
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = {
  errorHandler,
  notFoundHandler,
  asyncHandler
};

