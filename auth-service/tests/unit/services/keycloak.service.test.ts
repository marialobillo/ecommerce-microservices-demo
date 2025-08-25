// Mock axios completely
const mockAxiosInstance = {
  post: jest.fn(),
  get: jest.fn(),
  interceptors: {
    request: { use: jest.fn(), eject: jest.fn() },
    response: { use: jest.fn(), eject: jest.fn() }
  }
};

import { KeycloakService } from '../../../src/services/keycloak.service';
import { AuthError, AuthErrorType } from '../../../src/types/auth.types';
import {
  mockTokenResponse,
  mockUserInfo,
  TEST_USER,
  INVALID_USER,
  MOCK_ACCESS_TOKEN
} from '../../mocks/keycloak.mock';

describe('KeycloakService', () => {
  let keycloakService: KeycloakService;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    
    // Create KeycloakService with mocked axios instance
    keycloakService = new KeycloakService(mockAxiosInstance as any);
  });

  describe('login', () => {
    it('should successfully login with valid credentials', async () => {
      // Arrange
      mockAxiosInstance.post.mockResolvedValueOnce({ data: mockTokenResponse });
      mockAxiosInstance.get.mockResolvedValueOnce({ data: mockUserInfo });

      // Act
      const result = await keycloakService.login(TEST_USER);

      // Assert
      expect(result).toEqual({
        access_token: mockTokenResponse.access_token,
        refresh_token: mockTokenResponse.refresh_token,
        expires_in: mockTokenResponse.expires_in,
        user: {
          id: mockUserInfo.sub,
          username: mockUserInfo.preferred_username,
          email: mockUserInfo.email,
          name: mockUserInfo.name,
          roles: []
        }
      });

      expect(mockAxiosInstance.post).toHaveBeenCalledTimes(1);
      expect(mockAxiosInstance.get).toHaveBeenCalledTimes(1);
    });

    it('should throw AuthError for invalid credentials', async () => {
      // Arrange
      const error = {
        response: { 
          status: 401, 
          data: { error_description: 'Invalid credentials' } 
        },
        isAxiosError: true
      };
      
      mockAxiosInstance.post.mockRejectedValue(error);

      // Act & Assert
      await expect(keycloakService.login(INVALID_USER)).rejects.toThrow(AuthError);
    });
  });

  describe('getUserInfo', () => {
    it('should successfully get user info', async () => {
      // Arrange
      mockAxiosInstance.get.mockResolvedValue({ data: mockUserInfo });

      // Act
      const result = await keycloakService.getUserInfo(MOCK_ACCESS_TOKEN);

      // Assert
      expect(result).toEqual(mockUserInfo);
      expect(mockAxiosInstance.get).toHaveBeenCalledWith(
        expect.stringContaining('/userinfo'),
        {
          headers: {
            Authorization: `Bearer ${MOCK_ACCESS_TOKEN}`
          }
        }
      );
    });
  });

  describe('logout', () => {
    it('should handle logout successfully', async () => {
      // Arrange
      mockAxiosInstance.post.mockResolvedValue({ data: {} });

      // Act & Assert
      await expect(
        keycloakService.logout({ refresh_token: 'test-token' })
      ).resolves.not.toThrow();
      
      expect(mockAxiosInstance.post).toHaveBeenCalledTimes(1);
    });
  });
});