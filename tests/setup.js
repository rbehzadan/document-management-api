// Test setup file - runs before all tests
require('dotenv').config({ path: '.env.test' });

// Increase timeout for database operations
jest.setTimeout(10000);

// Global test database setup
beforeAll(async () => {
  // Ensure we're running in test environment
  if (process.env.NODE_ENV !== 'test') {
    throw new Error('Tests must be run with NODE_ENV=test');
  }

  // You can add global test setup here
  console.log('🧪 Test environment initialized');
});

// Global cleanup
afterAll(async () => {
  // Add any global cleanup here
  console.log('🧹 Test environment cleanup completed');
});

// Suppress console.log during tests (optional)
// Uncomment if you want cleaner test output
/*
global.console = {
  ...console,
  log: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  // Keep error for debugging
  error: console.error
};
*/
