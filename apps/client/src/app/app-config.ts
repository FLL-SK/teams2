export function getAppConfig() {
  console.log(process.env);
  return {
    graphQLUrl: process.env['NX_APP_GRAPHQL_URL'] ?? 'http://localhost:5000/graphql',
    restApiUrl: process.env['NX_APP_RESTAPI_URL'] ?? 'http://localhost:5000/api/v1',
    auth: {
      domain: process.env['NX_APP_AUTH_DOMAIN'] ?? 'fllsk-dev.eu.auth0.com',
      clientId: process.env['NX_APP_AUTH_CLIENT_ID'] ?? 'KhsK57vIU9x1QcW3ZhUeCKkMxM9ywibC',
      audience: process.env['NX_APP_AUTH_AUDIENCE'] ?? 'https://fllsk-dev.eu.auth0.com/api/v2/',
    },
    skipAuthentication: process.env['NX_APP_SKIP_AUTHENTICATION'] === 'true',
  };
}

export const appConfig = getAppConfig();
