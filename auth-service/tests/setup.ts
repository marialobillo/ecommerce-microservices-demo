// ⚠️  CRITICAL: This runs BEFORE importing any test modules
// Set environment variables IMMEDIATELY
process.env.NODE_ENV = 'test';
process.env.KEYCLOAK_URL = 'http://localhost:8080';
process.env.KEYCLOAK_REALM = 'ecommerce_master';
process.env.KEYCLOAK_CLIENT_ID = 'ecommerce-auth';
process.env.KEYCLOAK_CLIENT_SECRET = 'test-client-secret';

// Also set other test variables
process.env.DATABASE_URL = 'postgresql://postgres:postgres123@localhost:5432/ecommerce_test';
process.env.JWT_SECRET = 'test-jwt-secret-key-for-testing';
process.env.AUTH_SERVICE_PORT = '3001';
process.env.AUTH_SERVICE_URL = 'http://localhost:3001';

// Try to load .env.test if available (but don't fail if not)
try {
  const dotenv = require('dotenv');
  const path = require('path');
  const envTestPath = path.resolve(process.cwd(), '.env.test');
  
  // Load .env.test but don't override already set variables
  dotenv.config({ path: envTestPath });
  
  // Force the key test variables again to ensure they're set
  process.env.KEYCLOAK_CLIENT_SECRET = 'test-client-secret';
  
} catch (error) {
  // dotenv not available or .env.test doesn't exist - that's fine
  console.log('Note: dotenv/env.test not loaded, using hardcoded test values');
}

// Verify critical variables are set
const requiredVars = ['KEYCLOAK_URL', 'KEYCLOAK_REALM', 'KEYCLOAK_CLIENT_ID', 'KEYCLOAK_CLIENT_SECRET'];
for (const varName of requiredVars) {
  if (!process.env[varName]) {
    throw new Error(`Required test environment variable ${varName} is not set`);
  }
}

console.log('✅ Test environment variables loaded successfully');
console.log(`- KEYCLOAK_CLIENT_SECRET: ${process.env.KEYCLOAK_CLIENT_SECRET ? '***' + process.env.KEYCLOAK_CLIENT_SECRET.slice(-3) : 'NOT SET'}`);

// Set Jest timeout
jest.setTimeout(10000);

// Global test utilities (suppress console in tests)
global.console = {
  ...console,
  // Suppress most console output in tests for cleaner output
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: console.warn, // Keep warnings
  error: console.error, // Keep errors
};