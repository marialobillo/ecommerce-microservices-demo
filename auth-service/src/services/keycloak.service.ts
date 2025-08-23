import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { keycloakConfig, buildKeycloakUrl } from './../config/keycloak';
import {
  KeycloakTokenResponse,
  KeycloakUserInfo,
  LoginRequest,
  LoginResponse, 
  RefreshTokenRequest,
  LogoutRequest,
  AuthError, 
  AuthErrorType,
} from './../types/auth.types';

export class KeycloakService {
  private axios: AxiosInstance;

  constructor() {
    this.axios = axios.create({
      baseURL: keycloakConfig.serverUrl,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    // Response interceptor for error handling
    this.axios.interceptors.response.use(
      (response) => response,
      (error) => {
        console.error('Keycloak API Error: ', error.response?.data || error.message);
        throw new AuthError(
          AuthErrorType.KEYCLOAK_ERROR,
          error.response?.data?.error_description || error.message,
          error.response?.status || 500
        );
      }
    );
  }

  // Get user information from access token
  async getUserInfo(accessToken: string): Promise<KeycloakUserInfo> {
    try {
      const userInfoUrl = buildKeycloakUrl('userInfo')

      const response: AxiosResponse<KeycloakUserInfo> = await this.axios.get(
        userInfoUrl,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        throw new AuthError(
          AuthErrorType.TOKEN_INVALID,
          'Invalid or expired access token',
          401
        );
      }

      throw new AuthError(
        AuthErrorType.KEYCLOAK_ERROR,
        'Failed to get user info',
        500
      );
      
    }
  }

  // Authenticate use with username and password
  async login(loginData: LoginRequest): Promise<LoginResponse> {
    try {
      const tokenUrl = buildKeycloakUrl('token')

      const params = new URLSearchParams({
        grant_type: keycloakConfig.grantTypes.password,
        client_id: keycloakConfig.clientId,
        client_secret: keycloakConfig.clientSecret,
        username: loginData.username,
        password: loginData.password,
      })

      const response: AxiosResponse<KeycloakTokenResponse> = await this.axios.post(
        tokenUrl,
        params
      )

      const userInfo = await this.getUserInfo(response.data.access_token)

      return {
        access_token: response.data.access_token,
        refresh_token: response.data.refresh_token,
        expires_in: response.data.expires_in,
        user: {
          id: userInfo.sub,
          username: userInfo.preferred_username,
          email: userInfo.email,
          name: userInfo.name,
          roles: [], // Will be populated from JWT in token.service
        },
      }
    } catch (error) {
      if (error instanceof AuthError) {
        throw error;
      }

      if (axios.isAxiosError(error) && error.response?.status === 401) {
        throw new AuthError(
          AuthErrorType.INVALID_CREDENTIALS,
          'Invalid username or password',
          401
        );
      }

      throw new AuthError(
        AuthErrorType.KEYCLOAK_ERROR,
        'Failed to authenticate with Keycloak',
        500
      );
    }
  }

  // Refresh access token using refresh token
  async refreshToken(refreshData: RefreshTokenRequest): Promise<KeycloakTokenResponse> {
    try {
      const tokenUrl = buildKeycloakUrl('token')

      const params = new URLSearchParams({
        grant_type: keycloakConfig.grantTypes.refreshToken,
        client_id: keycloakConfig.clientId,
        client_secret: keycloakConfig.clientSecret,
        refresh_token: refreshData.refresh_token,
      });

      const response: AxiosResponse<KeycloakTokenResponse> = await this.axios.post(
        tokenUrl,
        params
      )
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 400) {
        throw new AuthError(
          AuthErrorType.TOKEN_EXPIRED,
          'Refresh token expired or invalid',
          401
        );
      }

      throw new AuthError(
        AuthErrorType.KEYCLOAK_ERROR,
        'Failed to refresh token',
        500
      )
    }
  }

  // Logout user by invalidating refresh token
  async logout(logoutData: LogoutRequest): Promise<void> {
    try {
      const logoutUrl = buildKeycloakUrl('logout');

      const params = new URLSearchParams({
        client_id: keycloakConfig.clientId,
        client_secret: keycloakConfig.clientSecret,
        refresh_token: logoutData.refresh_token,
      }); 

      await this.axios.post(logoutUrl, params);

    } catch (error) {
      console.error('Logout error (continuing anyway): ', error)
    }
  }

  // Introspect token to check if it's valid and active
  async introspectToken(token: string): Promise<any> {
    try {
      const introspectUrl = buildKeycloakUrl('introspect')

      const params = new URLSearchParams({
        token,
        client_id: keycloakConfig.clientId,
        client_secret: keycloakConfig.clientSecret,
      });

      const response = await this.axios.post(introspectUrl, params);
      return response.data;
    } catch (error) {
      throw new AuthError(
        AuthErrorType.KEYCLOAK_ERROR,
        'Failed to introspect token',
        500
      );
    }
  }

  // Get service account token for inter-service communication
  async getServiceAccountToken(): Promise<KeycloakTokenResponse> {
    try {
      const tokenUrl = buildKeycloakUrl('token')

      const params = new URLSearchParams({
        grant_type: keycloakConfig.grantTypes.clientCredentials,
        client_id: keycloakConfig.clientId,
        client_secret: keycloakConfig.clientSecret,
      });

      const response: AxiosResponse<KeycloakTokenResponse> = await this.axios.post(
        tokenUrl,
        params
      );
      return response.data;
    } catch (error) {
      throw new AuthError(
        AuthErrorType.KEYCLOAK_ERROR,
        'Failed to get service account token',
        500
      );
    }
  }
}


export const keycloakService = new KeycloakService();