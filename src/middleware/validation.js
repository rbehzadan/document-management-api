const { body, param, query } = require('express-validator');
const { VALIDATION, CLASSIFICATION_LEVELS } = require('../utils/constants');

// UUID validation helper
const isValidUUID = (value) => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(value);
};

// Document validation rules
const documentValidation = {
  // Create document validation
  create: [
    body('title')
      .trim()
      .isLength({ min: VALIDATION.DOCUMENT.TITLE_MIN_LENGTH })
      .withMessage(`Title must be at least ${VALIDATION.DOCUMENT.TITLE_MIN_LENGTH} character`)
      .isLength({ max: VALIDATION.DOCUMENT.TITLE_MAX_LENGTH })
      .withMessage(`Title must not exceed ${VALIDATION.DOCUMENT.TITLE_MAX_LENGTH} characters`)
      .escape(), // Sanitize HTML entities

    body('content')
      .trim()
      .notEmpty()
      .withMessage('Content is required')
      .isLength({ max: VALIDATION.DOCUMENT.CONTENT_MAX_LENGTH })
      .withMessage(`Content must not exceed ${VALIDATION.DOCUMENT.CONTENT_MAX_LENGTH} characters`),

    body('classification')
      .optional()
      .isInt({ min: 1, max: 4 })
      .withMessage('Classification must be between 1 (PUBLIC) and 4 (SECRET)')
      .custom((value) => {
        const validLevels = Object.values(CLASSIFICATION_LEVELS);
        if (!validLevels.includes(parseInt(value))) {
          throw new Error('Invalid classification level');
        }
        return true;
      }),

    body('owner_id')
      .optional()
      .isString()
      .withMessage('Owner ID must be a string')
      .isLength({ min: 1, max: 255 })
      .withMessage('Owner ID must be between 1 and 255 characters')
  ],

  // Update document validation
  update: [
    param('id')
      .custom((value) => {
        if (!isValidUUID(value)) {
          throw new Error('Invalid document ID format');
        }
        return true;
      }),

    body('title')
      .optional()
      .trim()
      .isLength({ min: VALIDATION.DOCUMENT.TITLE_MIN_LENGTH })
      .withMessage(`Title must be at least ${VALIDATION.DOCUMENT.TITLE_MIN_LENGTH} character`)
      .isLength({ max: VALIDATION.DOCUMENT.TITLE_MAX_LENGTH })
      .withMessage(`Title must not exceed ${VALIDATION.DOCUMENT.TITLE_MAX_LENGTH} characters`)
      .escape(),

    body('content')
      .optional()
      .trim()
      .notEmpty()
      .withMessage('Content cannot be empty')
      .isLength({ max: VALIDATION.DOCUMENT.CONTENT_MAX_LENGTH })
      .withMessage(`Content must not exceed ${VALIDATION.DOCUMENT.CONTENT_MAX_LENGTH} characters`),

    body('classification')
      .optional()
      .isInt({ min: 1, max: 4 })
      .withMessage('Classification must be between 1 (PUBLIC) and 4 (SECRET)')
      .custom((value) => {
        const validLevels = Object.values(CLASSIFICATION_LEVELS);
        if (!validLevels.includes(parseInt(value))) {
          throw new Error('Invalid classification level');
        }
        return true;
      })
  ],

  // Get by ID validation
  getById: [
    param('id')
      .custom((value) => {
        if (!isValidUUID(value)) {
          throw new Error('Invalid document ID format');
        }
        return true;
      })
  ],

  // Delete validation
  delete: [
    param('id')
      .custom((value) => {
        if (!isValidUUID(value)) {
          throw new Error('Invalid document ID format');
        }
        return true;
      })
  ],

  // Query validation for filtering
  query: [
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Page must be a positive integer'),

    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit must be between 1 and 100'),

    query('classification')
      .optional()
      .isInt({ min: 1, max: 4 })
      .withMessage('Classification must be between 1 (PUBLIC) and 4 (SECRET)'),

    query('search')
      .optional()
      .trim()
      .isLength({ min: 1, max: 255 })
      .withMessage('Search query must be between 1 and 255 characters')
      .escape(),

    query('owner_id')
      .optional()
      .isString()
      .withMessage('Owner ID must be a string')
      .isLength({ min: 1, max: 255 })
      .withMessage('Owner ID must be between 1 and 255 characters')
  ]
};

// User validation rules (for future use)
const userValidation = {
  register: [
    body('username')
      .trim()
      .isLength({ min: VALIDATION.USER.USERNAME_MIN_LENGTH })
      .withMessage(`Username must be at least ${VALIDATION.USER.USERNAME_MIN_LENGTH} characters`)
      .isLength({ max: VALIDATION.USER.USERNAME_MAX_LENGTH })
      .withMessage(`Username must not exceed ${VALIDATION.USER.USERNAME_MAX_LENGTH} characters`)
      .matches(/^[a-zA-Z0-9_-]+$/)
      .withMessage('Username can only contain letters, numbers, underscores, and hyphens'),

    body('email')
      .trim()
      .isEmail()
      .withMessage('Must be a valid email address')
      .isLength({ max: VALIDATION.USER.EMAIL_MAX_LENGTH })
      .withMessage(`Email must not exceed ${VALIDATION.USER.EMAIL_MAX_LENGTH} characters`)
      .normalizeEmail(),

    body('password')
      .isLength({ min: VALIDATION.USER.PASSWORD_MIN_LENGTH })
      .withMessage(`Password must be at least ${VALIDATION.USER.PASSWORD_MIN_LENGTH} characters`)
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number')
  ],

  login: [
    body('username')
      .trim()
      .notEmpty()
      .withMessage('Username is required'),

    body('password')
      .notEmpty()
      .withMessage('Password is required')
  ]
};

// API Key validation rules (for future use)
const apiKeyValidation = {
  create: [
    body('name')
      .trim()
      .isLength({ min: VALIDATION.API_KEY.NAME_MIN_LENGTH })
      .withMessage(`API key name must be at least ${VALIDATION.API_KEY.NAME_MIN_LENGTH} character`)
      .isLength({ max: VALIDATION.API_KEY.NAME_MAX_LENGTH })
      .withMessage(`API key name must not exceed ${VALIDATION.API_KEY.NAME_MAX_LENGTH} characters`)
      .escape(),

    body('expires_at')
      .optional()
      .isISO8601()
      .withMessage('Expiration date must be in ISO 8601 format')
      .custom((value) => {
        if (new Date(value) <= new Date()) {
          throw new Error('Expiration date must be in the future');
        }
        return true;
      })
  ]
};

module.exports = {
  documentValidation,
  userValidation,
  apiKeyValidation
};
