import * as express from 'express';
import * as cors from 'cors';
import * as expressjwt from 'express-jwt';
import jwksRsa = require('jwks-rsa');
import { command } from 'yargs';
import { resolve } from 'path';

import { loadDotEnvFiles } from './app/utils/env-loader';
import { getAppConfig } from './app-config';
import { bootstrapMongoDB, dbSeed } from './app/db';
import { bootstrapApolloServer } from './app/graphql/bootstrap-apollo-server';

import { logger } from '@teams2/logger';
const log = logger('main');

loadDotEnvFiles();

async function server() {
  const port = getAppConfig().port;
  log.info('Starting server ...', { appConfig: getAppConfig() });
  log.info(`Environment: ${process.env.NODE_ENV}`);
  const appConfig = getAppConfig();
  const app = express();

  // CORS configuration
  const corsOptions = {
    origin: ['http://localhost:5000', 'http://localhost:4200'],
    preflightContinue: true,
    credentials: true,
    // methods: 'GET,HEAD,PUT,PATCH,POST,DELETE, OPTIONS'
  };

  app.use(cors(corsOptions));

  await bootstrapMongoDB();

  const jwksOptions = {
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: appConfig.auth0.jwksUri,
  };

  const jwtCheck = expressjwt({
    secret: jwksRsa.expressJwtSecret(jwksOptions),
    credentialsRequired: false,
    audience: appConfig.auth0.audience,
    issuer: appConfig.auth0.issuer,
    algorithms: ['RS256'],
    getToken: (req): string | null => {
      if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
        return req.headers.authorization.split(' ')[1];
      } else if (req.query && req.query.access_token) {
        return req.query.access_token as string;
      }
      return null;
    },
  });

  app.use(jwtCheck);

  await bootstrapApolloServer(app);

  const assetsPath = __dirname + '/assets';

  app.use(express.static(assetsPath));

  app.get('*', function (request, response) {
    response.sendFile(resolve(assetsPath, 'index.html'));
  });
  log.info(`Starting http server ...`, { port });

  const server = app.listen(port, () => {
    log.info(`Listening at http://localhost:${port}/graphql`);
  });
  server.on('error', (e) => {
    log.fatal('Express Server on error handler', e);
  });
}

async function seedDb() {
  await bootstrapMongoDB();
  await dbSeed();
}

const argv = command('dbseed', 'Perform db-seed').help().alias('help', 'h').argv;
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
//@ts-ignore
if (argv._.includes('dbseed')) {
  seedDb()
    .then(() => {
      log.info({}, 'db-seed completed');
      process.exit(0);
    })
    .catch((e) => log.fatal('ds-seed failed', e));
} else {
  server()
    .then(() => {
      log.info('server completed');
    })
    .catch((e) => {
      log.fatal('server failed', e);
      process.exit(1);
    });
}
