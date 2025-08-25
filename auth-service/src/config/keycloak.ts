// Dynamic configuration that reads environment variables each time it's accessed
const getKeycloakConfigInternal = () => ({
  // Keycloak server configuration
  serverUrl: process.env.KEYCLOAK_URL || 'http://localhost:8080',
  realm: process.env.KEYCLOAK_REALM || 'ecommerce_master',
  clientId: process.env.KEYCLOAK_CLIENT_ID || 'ecommerce-auth',
  clientSecret: process.env.KEYCLOAK_CLIENT_SECRET || '',
  
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

  // Token configuration
  token: {
    // Token será válido por 15 minutos por defecto
    accessTokenLifespan: 15 * 60, // 15 minutes in seconds
    refreshTokenLifespan: 30 * 24 * 60 * 60, // 30 days in seconds
  }
});

// Create a proxy that dynamically returns the config
export const keycloakConfig = new Proxy({} as ReturnType<typeof getKeycloakConfigInternal>, {
  get: (target, prop) => {
    const config = getKeycloakConfigInternal();
    return config[prop as keyof typeof config];
  },
  ownKeys: (target) => {
    const config = getKeycloakConfigInternal();
    return Reflect.ownKeys(config);
  },
  getOwnPropertyDescriptor: (target, prop) => {
    const config = getKeycloakConfigInternal();
    return Reflect.getOwnPropertyDescriptor(config, prop);
  }
});

/**
 * Build full URL for Keycloak endpoints
 */
export const buildKeycloakUrl = (endpoint: string): string => {
  const config = getKeycloakConfigInternal();
  const url = config.endpoints[endpoint as keyof typeof config.endpoints];
  if (!url) {
    throw new Error(`Unknown Keycloak endpoint: ${endpoint}`);
  }
  
  return `${config.serverUrl}${url.replace('{realm}', config.realm)}`;
};

/**
 * Validate Keycloak configuration
 */
export const validateKeycloakConfig = (): void => {
  const config = getKeycloakConfigInternal();
  const required = ['serverUrl', 'realm', 'clientId', 'clientSecret'];
  
  for (const field of required) {
    if (!config[field as keyof typeof config]) {
      throw new Error(`Missing required Keycloak configuration: ${field}`);
    }
  }
  
  console.log('✅ Keycloak configuration validated successfully');
};