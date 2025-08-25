describe('Keycloak Configuration', () => {
  // Import dinámico después de que las variables de entorno están establecidas
  let keycloakConfig: any;
  let buildKeycloakUrl: any;
  let validateKeycloakConfig: any;

  beforeAll(async () => {
    // Asegurar que las variables de entorno están establecidas
    process.env.KEYCLOAK_URL = 'http://localhost:8080';
    process.env.KEYCLOAK_REALM = 'ecommerce_master';
    process.env.KEYCLOAK_CLIENT_ID = 'ecommerce-auth';
    process.env.KEYCLOAK_CLIENT_SECRET = 'test-client-secret';

    // Import dinámico
    const keycloakModule = await import('../../../src/config/keycloak');
    keycloakConfig = keycloakModule.keycloakConfig;
    buildKeycloakUrl = keycloakModule.buildKeycloakUrl;
    validateKeycloakConfig = keycloakModule.validateKeycloakConfig;
  });

  describe('keycloakConfig', () => {
    it('should have all required properties', () => {
      expect(keycloakConfig).toHaveProperty('serverUrl');
      expect(keycloakConfig).toHaveProperty('realm');
      expect(keycloakConfig).toHaveProperty('clientId');
      expect(keycloakConfig).toHaveProperty('clientSecret');
      expect(keycloakConfig).toHaveProperty('endpoints');
      expect(keycloakConfig).toHaveProperty('grantTypes');
      expect(keycloakConfig).toHaveProperty('token');
    });

    it('should have test environment values', () => {
      expect(keycloakConfig.serverUrl).toBe('http://localhost:8080');
      expect(keycloakConfig.realm).toBe('ecommerce_master');
      expect(keycloakConfig.clientId).toBe('ecommerce-auth');
      expect(keycloakConfig.clientSecret).toBe('test-client-secret');
    });

    it('should have correct endpoints structure', () => {
      expect(keycloakConfig.endpoints).toEqual({
        token: '/realms/{realm}/protocol/openid-connect/token',
        userInfo: '/realms/{realm}/protocol/openid-connect/userinfo',
        logout: '/realms/{realm}/protocol/openid-connect/logout',
        certs: '/realms/{realm}/protocol/openid-connect/certs',
        introspect: '/realms/{realm}/protocol/openid-connect/token/introspect',
      });
    });
  });

  describe('buildKeycloakUrl', () => {
    it('should build correct token URL', () => {
      const tokenUrl = buildKeycloakUrl('token');
      expect(tokenUrl).toBe(
        'http://localhost:8080/realms/ecommerce_master/protocol/openid-connect/token'
      );
    });

    it('should build correct userInfo URL', () => {
      const userInfoUrl = buildKeycloakUrl('userInfo');
      expect(userInfoUrl).toBe(
        'http://localhost:8080/realms/ecommerce_master/protocol/openid-connect/userinfo'
      );
    });

    it('should throw error for unknown endpoint', () => {
      expect(() => buildKeycloakUrl('unknown')).toThrow(
        'Unknown Keycloak endpoint: unknown'
      );
    });
  });

  describe('validateKeycloakConfig', () => {
    it('should pass validation with test configuration', () => {
      expect(() => validateKeycloakConfig()).not.toThrow();
    });
  });
});