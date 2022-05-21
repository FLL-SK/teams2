export function getServerConfig() {
  return {
    // https://stackoverflow.com/questions/58090082/process-env-node-env-always-development-when-building-nestjs-app-with-nrwl-nx
    nodeEnv: process.env['NODE' + '_ENV'] || 'development',
    //skipAuthentication: process.env.APP_SKIP_AUTHENTICATION === 'true',
    host: process.env.APP_HOST ?? 'localhost',
    port: process.env.APP_PORT ?? 5000,
    mongoDBUri: process.env.APP_MONGODB ?? 'mongodb://localhost/teams2',

    graphQLSchemaPath: process.env.APP_GRAPHQL_SCHEMA_PATH ?? './dist/schema.graphql',
    smtp: {
      from: process.env.APP_SMTP_FROM,
      host: process.env.APP_SMTP_HOST,
      port: process.env.APP_SMTP_PORT,
      username: process.env.APP_SMTP_USERNAME,
      password: process.env.APP_SMTP_PASSWORD,
    },
    auth0: {
      jwksUri:
        process.env.APP_AUTH0_JWKS_URI ?? 'https://fllsk-dev.eu.auth0.com/.well-known/jwks.json',
      audience: process.env.APP_AUTH0_AUDIENCE ?? 'https://fllsk-dev.eu.auth0.com/api/v2/',
      issuer: process.env.APP_AUTH0_ISSUER ?? 'https://fllsk-dev.eu.auth0.com/',
      clientId: process.env.APP_AUTH0_CLIENT_ID ?? 'dummy-id',
      clientSecret: process.env.APP_AUTH0_CLIENT_SECRET ?? 'dummy-secret',
      // namespace for custom access token claims
      // used e.g. for adding user's email to access token
      // see https://auth0.com/docs/get-started/architecture-scenarios/spa-api/api-implementation-nodejs#4-determine-the-user-identity
      namespace: process.env.APP_AUTH0_NAMESPACE ?? 'https://fllsk.fllsk/',
    },
  };
}
