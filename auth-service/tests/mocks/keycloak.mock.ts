import { KeycloakTokenResponse, KeycloakUserInfo } from '../../src/types/auth.types';

// Mock JWT token (simplified for testing)
export const MOCK_ACCESS_TOKEN = 'eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJyWG1CMjJGVDJYeEh6bHJ4OEg4TUZVUm1ldWt5UUdNT0lRajZvZF9YeDUwIn0.eyJleHAiOjE2OTQxOTQzMDAsImlhdCI6MTY5NDE5MzQwMCwianRpIjoiYWJjZGVmZ2gtaWprbC1tbm9wLXFyc3QiLCJpc3MiOiJodHRwOi8vbG9jYWxob3N0OjgwODAvcmVhbG1zL2Vjb21tZXJjZV9tYXN0ZXIiLCJhdWQiOiJlY29tbWVyY2UtYXV0aCIsInN1YiI6IjEyMzQ1Njc4LTkwYWItY2RlZi0xMjM0LTU2Nzg5MGFiY2RlZiIsInR5cCI6IkJlYXJlciIsImF6cCI6ImVjb21tZXJjZS1hdXRoIiwic2Vzc2lvbl9zdGF0ZSI6InRlc3Qtc2Vzc2lvbiIsImFjciI6IjEiLCJhbGxvd2VkLW9yaWdpbnMiOlsiaHR0cDovL2xvY2FsaG9zdDozMDAwIiwiaHR0cDovL2xvY2FsaG9zdDozMDAxIl0sInJlYWxtX2FjY2VzcyI6eyJyb2xlcyI6WyJjdXN0b21lciJdfSwicmVzb3VyY2VfYWNjZXNzIjp7ImVjb21tZXJjZS1hdXRoIjp7InJvbGVzIjpbInVzZXIiXX19LCJzY29wZSI6ImVtYWlsIHByb2ZpbGUiLCJzaWQiOiJ0ZXN0LXNlc3Npb24iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwibmFtZSI6IkpvaG4gRG9lIiwicHJlZmVycmVkX3VzZXJuYW1lIjoidGVzdHVzZXIiLCJnaXZlbl9uYW1lIjoiSm9obiIsImZhbWlseV9uYW1lIjoiRG9lIiwiZW1haWwiOiJ0ZXN0dXNlckBleGFtcGxlLmNvbSJ9.fake_signature';

export const MOCK_REFRESH_TOKEN = 'mock-refresh-token-123';

// Mock token response from Keycloak
export const mockTokenResponse: KeycloakTokenResponse = {
  access_token: MOCK_ACCESS_TOKEN,
  expires_in: 900, // 15 minutes
  refresh_expires_in: 1800, // 30 minutes
  refresh_token: MOCK_REFRESH_TOKEN,
  token_type: 'Bearer',
  id_token: 'mock-id-token',
  'not-before-policy': 0,
  session_state: 'test-session-state',
  scope: 'email profile'
};

// Mock user info from Keycloak
export const mockUserInfo: KeycloakUserInfo = {
  sub: '12345678-90ab-cdef-1234-567890abcdef',
  email_verified: true,
  name: 'John Doe',
  preferred_username: 'testuser',
  given_name: 'John',
  family_name: 'Doe',
  email: 'testuser@example.com'
};

// Mock introspect response
export const mockIntrospectResponse = {
  active: true,
  scope: 'email profile',
  client_id: 'ecommerce-auth',
  username: 'testuser',
  token_type: 'Bearer',
  exp: Math.floor(Date.now() / 1000) + 900, // 15 minutes from now
  iat: Math.floor(Date.now() / 1000),
  sub: '12345678-90ab-cdef-1234-567890abcdef',
  aud: 'ecommerce-auth',
  iss: 'http://localhost:8080/realms/ecommerce_master',
  email: 'testuser@example.com',
  preferred_username: 'testuser'
};

// Common test data
export const TEST_USER = {
  username: 'testuser',
  password: 'testpass123',
  email: 'testuser@example.com',
  name: 'John Doe'
};

export const INVALID_USER = {
  username: 'invalid',
  password: 'wrong'
};

// Error responses
export const INVALID_CREDENTIALS_ERROR = {
  error: 'invalid_grant',
  error_description: 'Invalid user credentials'
};

export const TOKEN_EXPIRED_ERROR = {
  error: 'invalid_grant',
  error_description: 'Token is not valid'
};