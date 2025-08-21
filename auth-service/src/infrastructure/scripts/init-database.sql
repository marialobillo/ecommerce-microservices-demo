SELECT 'CREATE DATABASE keycloak' WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'keycloak')\gexec
SELECT 'CREATE DATABASE auth_service' WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'auth_service')\gexec  
SELECT 'CREATE DATABASE catalog_service' WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'catalog_service')\gexec
