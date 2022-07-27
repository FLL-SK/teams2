export function getServerConfig() {
  return {
    // https://stackoverflow.com/questions/58090082/process-env-node-env-always-development-when-building-nestjs-app-with-nrwl-nx
    nodeEnv: process.env['NODE' + '_ENV'] || 'development',
    //skipAuthentication: process.env.APP_SKIP_AUTHENTICATION === 'true',
    host: process.env.APP_HOST ?? 'localhost',
    // Heroku is using PORT env to specify the port
    port: process.env.PORT ? Number(process.env.PORT) ?? 5000 : 5000,

    mongoDBUri: process.env.APP_MONGODB ?? 'mongodb://localhost/teams2',

    graphQLSchemaPath: process.env.APP_GRAPHQL_SCHEMA_PATH ?? './dist/schema.graphql',
    smtp: {
      from: process.env.APP_SMTP_FROM,
      host: process.env.APP_SMTP_HOST,
      port: process.env.APP_SMTP_PORT ? Number(process.env.APP_SMTP_PORT) ?? 587 : 587,
      tls: (process.env.APP_SMTP_TLS ?? 'no').toLowerCase() === 'yes',
      username: process.env.APP_SMTP_USERNAME,
      password: process.env.APP_SMTP_PASSWORD,
    },
    jwt: {
      secret: process.env.APP_JWT_SECRET,
    },
    logoUrl: process.env.APP_LOGO_URL,
    clientAppRootUrl: process.env.APP_CLIENT_ROOT_URL ?? 'http://localhost:4200',
    s3: {
      region: process.env.AWS_REGION,
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      bucket: process.env.AWS_BUCKET,
    },
    invoicing: {
      type: 'superfaktura',
      sf: {
        apiUrl: process.env.NX_SF_API_URL,
        email: process.env.SF_AUTH_EMAIL,
        apiKey: process.env.SF_AUTH_API_KEY,
        companyId: process.env.SF_AUTH_COMPANY_ID,
        module: process.env.SF_AUTH_MODULE,
      },
    },
    adminEmail: process.env.TEAMS_ADMIN_EMAIL,
  };
}
