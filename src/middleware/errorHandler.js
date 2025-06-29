const logger = require('../utils/logger');

const errorHandler = (err, req, res, next) => {
  // Log the error
  logger.error('Error occurred:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });

  // Default error
  let error = {
    message: err.message || 'Internal Server Error',
    timestamp: new Date().toISOString()
  };

  let statusCode = err.status || err.statusCode || 500;

  // Handle specific error types
  if (err.name === 'ValidationError') {
    statusCode = 400;
    error.message = 'Validation Error';
    error.details = err.details || err.message;
  } else if (err.name === 'UnauthorizedError' || err.name === 'JsonWebTokenError') {
    statusCode = 401;
    error.message = 'Unauthorized';
  } else if (err.name === 'ForbiddenError') {
    statusCode = 403;
    error.message = 'Forbidden';
  } else if (err.code === '23505') { // PostgreSQL unique violation
    statusCode = 409;
    error.message = 'Resource already exists';
  } else if (err.code === '23503') { // PostgreSQL foreign key violation
    statusCode = 400;
    error.message = 'Invalid reference';
  } else if (err.code === '23502') { // PostgreSQL not null violation
    statusCode = 400;
    error.message = 'Missing required field';
  }

  // Don't leak error details in production
  if (process.env.NODE_ENV === 'production' && statusCode === 500) {
    error.message = 'Internal Server Error';
    delete error.stack;
  }

  // Add stack trace in development
  if (process.env.NODE_ENV === 'development') {
    error.stack = err.stack;
  }

  res.status(statusCode).json({ error });
};

module.exports = errorHandler;
