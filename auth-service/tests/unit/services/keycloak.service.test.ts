import axios from 'axios';
import { KeycloakService } from './../../../src/services/keycloak.service';
import { AuthError, AuthErrorType } from './../../../src/types/auth.types';
import {
  mockTokenResponse,
  mockUserInfo,
  mockIntrospectResponse,
  TEST_USER,
  INVALID_USER,
  INVALID_CREDENTIALS_ERROR,
  TOKEN_EXPIRED_ERROR,
  MOCK_ACCESS_TOKEN,
  MOCK_REFRESH_TOKEN
} from '../../mocks/keycloak.mock';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('KeycloakService', () => {
  let keycloakService: KeycloakService;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Mock axios.create
    mockedAxios.create = jest.fn(() => mockedAxios);
    mockedAxios.interceptors = {
      request: { use: jest.fn(), eject: jest.fn() },
      response: { use: jest.fn(), eject: jest.fn() }
    } as any;

    keycloakService = new KeycloakService();
  });

  describe('login', () => {

    it('should successfully login with valid credentials', async () => {

      mockedAxios.post
        .mockResolvedValueOnce({ data: mockTokenResponse })
        .mockResolvedValueOnce({ data: mockUserInfo });

      mockedAxios.get = jest.fn().mockResolvedValue({ data: mockUserInfo });

      const result = await keycloakService.login(TEST_USER);

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

      expect(mockedAxios.post).toHaveBeenCalledTimes(1)
      expect(mockedAxios.get).toHaveBeenCalledTimes(1)
    });

    it('should throw AuthError for invalid credentials', async () => {
      const error = {
        response: { status: 401, data: INVALID_CREDENTIALS_ERROR },
        isAxiosError: true
      };
      mockedAxios.post.mockRejectedValue(error);

      await expect(keycloakService.login(INVALID_USER)).rejects.toThrow(AuthError);
      await expect(keycloakService.login(INVALID_USER)).rejects.toMatchObject({
        type: AuthErrorType.INVALID_CREDENTIALS,
        statusCode: 401
      });
    });

    it('should handle network errors', async () => {
      mockedAxios.post.mockRejectedValue(new Error('Network Error'));

      await expect(keycloakService.login(TEST_USER)).rejects.toThrow(AuthError);
      await expect(keycloakService.login(TEST_USER)).rejects.toMatchObject({
        type: AuthErrorType.KEYCLOAK_ERROR,
        statusCode: 500
      });
    });
  });

  describe('refreshToken', () => {
    it('should successfully refresh token', async () => {
      const newTokenResponse = { ...mockTokenResponse, access_token: 'new-access-token' };
      mockedAxios.post.mockResolvedValue({ data: newTokenResponse });

      const result = await keycloakService.refreshToken({ refresh_token: MOCK_REFRESH_TOKEN });

      expect(result).toEqual(newTokenResponse);
      expect(mockedAxios.post).toHaveBeenCalledWith(
        expect.stringContaining('/token'),
        expect.any(URLSearchParams)
      );
    });

    it('should throw AuthError for expired refresh token', async () => {
      const error = {
        response: { status: 400, data: TOKEN_EXPIRED_ERROR },
        isAxiosError: true
      };
      mockedAxios.post.mockRejectedValue(error);

      await expect(
        keycloakService.refreshToken({ refresh_token: 'expired-token' })
      ).rejects.toThrow(AuthError);
    });
  });

  describe('getUserInfo', () => {
    it('should successfully get user info', async () => {
      mockedAxios.get.mockResolvedValue({ data: mockUserInfo });

      const result = await keycloakService.getUserInfo(MOCK_ACCESS_TOKEN);

      expect(result).toEqual(mockUserInfo);
      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.stringContaining('/userinfo'),
        {
          headers: {
            Authorization: `Bearer ${MOCK_ACCESS_TOKEN}`
          }
        }
      );
    });

    it('should throw AuthError for invalid token', async () => {
      const error = {
        response: { status: 401, data: { error: 'invalid_token' } },
        isAxiosError: true
      };
      mockedAxios.get.mockRejectedValue(error);

      await expect(keycloakService.getUserInfo('invalid-token')).rejects.toThrow(AuthError);
    });
  });

  describe('logout', () => {
    it('should successfully logout', async () => {
      mockedAxios.post.mockResolvedValue({ data: {} });

      await expect(keycloakService.logout({ refresh_token: MOCK_REFRESH_TOKEN }))
        .resolves.not.toThrow();
      
      expect(mockedAxios.post).toHaveBeenCalledWith(
        expect.stringContaining('/logout'),
        expect.any(URLSearchParams)
      );
    });

    it('should handle logout errors gracefully', async () => {
      mockedAxios.post.mockRejectedValue(new Error('Logout failed'));

      await expect(keycloakService.logout({ refresh_token: MOCK_REFRESH_TOKEN }))
        .resolves.not.toThrow();
    });
  });

});