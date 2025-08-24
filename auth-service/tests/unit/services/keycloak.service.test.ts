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

})