const { CLASSIFICATION_LEVELS } = require('../../src/utils/constants');

// Sample documents for testing
const sampleDocuments = {
  public: {
    title: 'Public Test Document',
    content: 'This is a public document available to everyone',
    classification: CLASSIFICATION_LEVELS.PUBLIC,
    owner_id: 'public-user'
  },

  internal: {
    title: 'Internal Test Document',
    content: 'This is an internal document for company use',
    classification: CLASSIFICATION_LEVELS.INTERNAL,
    owner_id: 'internal-user'
  },

  confidential: {
    title: 'Confidential Test Document',
    content: 'This is confidential information restricted to specific teams',
    classification: CLASSIFICATION_LEVELS.CONFIDENTIAL,
    owner_id: 'confidential-user'
  },

  secret: {
    title: 'Secret Test Document',
    content: 'This is highly classified information',
    classification: CLASSIFICATION_LEVELS.SECRET,
    owner_id: 'secret-user'
  }
};

// Sample users for future auth testing
const sampleUsers = {
  admin: {
    username: 'admin',
    email: 'admin@example.com',
    password: 'AdminPass123',
    role: 'admin'
  },

  manager: {
    username: 'manager',
    email: 'manager@example.com',
    password: 'ManagerPass123',
    role: 'manager'
  },

  editor: {
    username: 'editor',
    email: 'editor@example.com',
    password: 'EditorPass123',
    role: 'editor'
  },

  viewer: {
    username: 'viewer',
    email: 'viewer@example.com',
    password: 'ViewerPass123',
    role: 'viewer'
  }
};

// Sample API keys for testing
const sampleApiKeys = {
  adminKey: {
    name: 'Admin API Key',
    user_id: 'admin-user-id',
    key: 'test-api-key-admin-123456789abcdef'
  },

  serviceKey: {
    name: 'Service Integration Key',
    user_id: 'service-user-id',
    key: 'test-api-key-service-987654321fedcba'
  }
};

// Sample JWT payloads
const sampleJWTPayloads = {
  admin: {
    id: 'admin-user-id',
    username: 'admin',
    email: 'admin@example.com',
    role: 'admin',
    permissions: ['read', 'write', 'delete', 'admin']
  },

  editor: {
    id: 'editor-user-id',
    username: 'editor',
    email: 'editor@example.com',
    role: 'editor',
    permissions: ['read', 'write']
  },

  viewer: {
    id: 'viewer-user-id',
    username: 'viewer',
    email: 'viewer@example.com',
    role: 'viewer',
    permissions: ['read']
  }
};

// Test validation cases
const validationTestCases = {
  documents: {
    valid: [
      {
        title: 'Valid Document',
        content: 'This is valid content',
        classification: CLASSIFICATION_LEVELS.INTERNAL
      },
      {
        title: 'A',
        content: 'Minimal valid content',
        classification: CLASSIFICATION_LEVELS.PUBLIC
      }
    ],

    invalid: [
      {
        // Missing title
        content: 'Content without title',
        classification: CLASSIFICATION_LEVELS.INTERNAL
      },
      {
        title: '',
        content: 'Empty title',
        classification: CLASSIFICATION_LEVELS.INTERNAL
      },
      {
        title: 'Title without content',
        // Missing content
        classification: CLASSIFICATION_LEVELS.INTERNAL
      },
      {
        title: 'Invalid classification',
        content: 'Content here',
        classification: 99 // Invalid level
      }
    ]
  },

  users: {
    valid: [
      {
        username: 'validuser',
        email: 'valid@example.com',
        password: 'ValidPass123'
      },
      {
        username: 'test_user_123',
        email: 'test.user@example.com',
        password: 'TestPass123'
      }
    ],

    invalid: [
      {
        // Username too short
        username: 'ab',
        email: 'valid@example.com',
        password: 'ValidPass123'
      },
      {
        username: 'validuser',
        email: 'invalid-email',
        password: 'ValidPass123'
      },
      {
        username: 'validuser',
        email: 'valid@example.com',
        password: 'weak' // Password too short/weak
      },
      {
        username: 'invalid@user', // Invalid characters
        email: 'valid@example.com',
        password: 'ValidPass123'
      }
    ]
  }
};

// Helper functions for test setup
const testHelpers = {
  /**
   * Generate a valid document with random data
   */
  generateRandomDocument: (overrides = {}) => ({
    title: `Test Document ${Date.now()}`,
    content: `Random test content generated at ${new Date().toISOString()}`,
    classification: CLASSIFICATION_LEVELS.INTERNAL,
    owner_id: `test-user-${Date.now()}`,
    ...overrides
  }),

  /**
   * Generate multiple documents for bulk testing
   */
  generateMultipleDocuments: (count = 5, baseData = {}) => {
    return Array.from({ length: count }, (_, index) => ({
      title: `Bulk Test Document ${index + 1}`,
      content: `Content for bulk test document number ${index + 1}`,
      classification: CLASSIFICATION_LEVELS.INTERNAL,
      owner_id: `bulk-test-user-${index + 1}`,
      ...baseData
    }));
  },

  /**
   * Generate test user data
   */
  generateRandomUser: (overrides = {}) => ({
    username: `testuser${Date.now()}`,
    email: `test${Date.now()}@example.com`,
    password: 'TestPass123',
    ...overrides
  }),

  /**
   * Create test API key data
   */
  generateApiKey: (overrides = {}) => ({
    name: `Test API Key ${Date.now()}`,
    user_id: `test-user-${Date.now()}`,
    key: `test-key-${Date.now()}-${Math.random().toString(36).substring(7)}`,
    ...overrides
  })
};

// Error response templates for testing
const errorResponses = {
  validation: {
    error: 'Validation failed',
    details: expect.any(Array)
  },

  notFound: {
    error: 'Document not found',
    message: expect.any(String)
  },

  unauthorized: {
    error: 'Unauthorized',
    message: expect.any(String)
  },

  forbidden: {
    error: 'Forbidden',
    message: expect.any(String)
  }
};

// Success response templates
const successResponses = {
  created: {
    data: expect.any(Object),
    message: expect.any(String),
    timestamp: expect.any(String)
  },

  ok: {
    data: expect.any(Object),
    timestamp: expect.any(String)
  },

  list: {
    data: expect.any(Array),
    meta: {
      pagination: {
        page: expect.any(Number),
        limit: expect.any(Number),
        total: expect.any(Number),
        totalPages: expect.any(Number),
        hasNext: expect.any(Boolean),
        hasPrev: expect.any(Boolean)
      }
    },
    timestamp: expect.any(String)
  }
};

module.exports = {
  sampleDocuments,
  sampleUsers,
  sampleApiKeys,
  sampleJWTPayloads,
  validationTestCases,
  testHelpers,
  errorResponses,
  successResponses
};
