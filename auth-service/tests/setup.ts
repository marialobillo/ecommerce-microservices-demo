import dotenv from 'dotenv';

dotenv.config({ path: '.env.test' })

// Set test environment
process.env.NODE_ENV = 'test'
process.env.KEYCLOAK_URL = 'http://localhost:8080'
process.env.KEYCLOAK_REALM = 'ecommerce_master';
process.env.KEYCLOAK_CLIENT_ID = 'ecommerce-auth';
process.env.KEYCLOAK_CLIENT_SECRET = 'test-client-secret';

// Increase timeout for async operations
jest.setTimeout(10000);

// Global test utilities
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: console.warn,
  error: console.error,
};