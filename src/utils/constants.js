// Document classification levels
const CLASSIFICATION_LEVELS = {
  PUBLIC: 1,
  INTERNAL: 2,
  CONFIDENTIAL: 3,
  SECRET: 4
};

// Reverse mapping for display purposes
const CLASSIFICATION_NAMES = {
  1: 'PUBLIC',
  2: 'INTERNAL', 
  3: 'CONFIDENTIAL',
  4: 'SECRET'
};

// Document permission levels for sharing
const PERMISSION_LEVELS = {
  READ: 'read',
  WRITE: 'write',
  ADMIN: 'admin'
};

// Authentication methods
const AUTH_METHODS = {
  BASIC: 'basic',
  API_KEY: 'api_key',
  JWT: 'jwt',
  OAUTH: 'oauth',
  MTLS: 'mtls'
};

// User roles (for RBAC)
const USER_ROLES = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  EDITOR: 'editor',
  VIEWER: 'viewer'
};

// API response status codes
const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500
};

// Validation constraints
const VALIDATION = {
  DOCUMENT: {
    TITLE_MIN_LENGTH: 1,
    TITLE_MAX_LENGTH: 255,
    CONTENT_MAX_LENGTH: 1000000, // 1MB text
  },
  USER: {
    USERNAME_MIN_LENGTH: 3,
    USERNAME_MAX_LENGTH: 50,
    PASSWORD_MIN_LENGTH: 8,
    EMAIL_MAX_LENGTH: 255
  },
  API_KEY: {
    NAME_MIN_LENGTH: 1,
    NAME_MAX_LENGTH: 100,
    KEY_LENGTH: 32 // bytes, will be hex encoded to 64 chars
  }
};

// JWT configuration
const JWT_CONFIG = {
  ACCESS_TOKEN_EXPIRY: '1h',
  REFRESH_TOKEN_EXPIRY: '7d',
  ISSUER: 'document-management-api',
  AUDIENCE: 'document-management-users'
};

// Rate limiting defaults
const RATE_LIMITS = {
  GENERAL: {
    WINDOW_MS: 15 * 60 * 1000, // 15 minutes
    MAX_REQUESTS: 100
  },
  AUTH: {
    WINDOW_MS: 15 * 60 * 1000, // 15 minutes  
    MAX_REQUESTS: 10 // Stricter for auth endpoints
  },
  API_KEY: {
    WINDOW_MS: 60 * 1000, // 1 minute
    MAX_REQUESTS: 1000 // Higher for API key usage
  }
};

// Database table names
const TABLES = {
  DOCUMENTS: 'documents',
  DOCUMENT_VERSIONS: 'document_versions',
  DOCUMENT_SHARES: 'document_shares',
  USERS: 'users',
  GROUPS: 'groups',
  ROLES: 'roles',
  PERMISSIONS: 'permissions',
  USER_GROUPS: 'user_groups',
  GROUP_ROLES: 'group_roles',
  ROLE_PERMISSIONS: 'role_permissions',
  API_KEYS: 'api_keys',
  USER_ATTRIBUTES: 'user_attributes',
  POLICIES: 'policies'
};

module.exports = {
  CLASSIFICATION_LEVELS,
  CLASSIFICATION_NAMES,
  PERMISSION_LEVELS,
  AUTH_METHODS,
  USER_ROLES,
  HTTP_STATUS,
  VALIDATION,
  JWT_CONFIG,
  RATE_LIMITS,
  TABLES
};
