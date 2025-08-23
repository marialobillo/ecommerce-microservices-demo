
export const keycloakConfig = {
  serverUrl: process.env.KEYCLOAK_URL || 'http://localhost:8080',
  realm: process.env.KEYCLOAK_REALM || 'ecommerce_master',
  clientId: process.env.KEYCLOAK_CLIENT_ID || 'ecommerce-auth',
  clientSecret: process.env.KEYCLOAK_CLIENT_SECRETE || '',

  // Auth endpoints
  endpoints: {
    token: '/realms/{realm}/protocol/openid-connect/token',
    userInfo: '/realms/{realm}/protocol/openid-connect/userinfo',
    logout: '/realms/{realm}/protocol/openid-connect/logout',
    certs: '/realms/{realm}/protocol/openid-connect/certs',
    introspect: '/realms/{realm}/protocol/openid-connect/token/introspect',
  },

  // Grant types
  grantTypes: {
    password: 'password',
    refreshToken: 'refresh_token',
    clientCredentials: 'client_credentials',
  },

  // Token Configuration
  token: {
    accessTokenLifespan: 15 * 60, // 15 minutes in seconds
    refreshTokenLifespan: 30 * 24 * 60 * 60, // 30 days in seconds
  }
}

/**
 * Build full URL for Keycloak endpoints
 */
export const buildKeycloakUrl = (endpoint: string): string => {
  const url = keycloakConfig.endpoints[endpoint as keyof typeof keycloakConfig.endpoints];
  if (!url) {
    throw new Error(`Unknown Keycloak endpoint: ${endpoint}`);
  }
  
  return `${keycloakConfig.serverUrl}${url.replace('{realm}', keycloakConfig.realm)}`;
};

/*
* Validate Keycloak configuration
*/
export const validateKeycloakConfig = (): void => {
  const required = ['serverUrl', 'realm', 'clientId', 'clientSecret']

  for (const field of required) {
    if (!keycloakConfig[field as keyof typeof keycloakConfig]) {
      throw new Error(`Missing required Keycloak configuration: ${field}`)
    }
  }

  console.log('✅ Keycloak configuration validated successfully');
}