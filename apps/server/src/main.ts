import dotenv from 'dotenv';
dotenv.config();

import cors from 'cors';
import morgan from 'morgan';
import { command } from 'yargs';
import { configureAuth } from './app/configure-auth';
import { getServerConfig } from './server-config';
import { bootstrapMongoDB, testDbSeed } from './app/db';
import { bootstrapApolloServer } from './app/apollo/bootstrap-apollo-server';

import { logger } from '@teams2/logger';
import { buildRootRouter } from './app/routes';
import passport from 'passport';
import express from 'express';
import { initSettingsLoader } from './app/utils/settings';

const log = logger('main');

async function server() {
  const port = getServerConfig().port;
  log.info('Starting server ...');
  log.info('Config: %o', getServerConfig());
  log.info(`Environment: ${process.env.NODE_ENV}`);
  log.info(`Debug: ${process.env.DEBUG}`);
  const app = express();

  // CORS configuration
  const corsOptions = {
    origin: getServerConfig().clientAppRootUrlsForCORS,
    preflightContinue: false,
    credentials: false,
    // methods: 'GET,HEAD,PUT,PATCH,POST,DELETE, OPTIONS'
  };

  log.info('Configuring CORS ... %o', corsOptions);

  app.use(morgan('tiny'));
  app.use(cors(corsOptions));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  await bootstrapMongoDB();

  // configure passport authentication
  configureAuth(app);

  const rootRouter = buildRootRouter();
  app.use('/', rootRouter);

  const graphQlMW = await bootstrapApolloServer(app);

  app.use('/graphql', (req, res, next) => {
    passport.authenticate('jwt', { session: false }, (err, user) => {
      if (user) {
        req.user = user;
      } else {
        log.warn('Unauthorized request /graphql from ip=%s body=%o', req.ip.toString(), req.body);

        return res.status(401).send('Unauthorized');
      }

      next();
    })(req, res, next);
  });

  app.use('/graphql', graphQlMW);

  const assetsPath = __dirname + '/assets';
  app.use(express.static(assetsPath));

  // initialize system loaders
  initSettingsLoader();

  // app.get('*', function (request, response) {
  //   response.sendFile(resolve(assetsPath, 'index.html'));
  // });
  log.info(`Starting http server ...`, { port });

  const server = app.listen(port, () => {
    log.info(`Listening at http://localhost:${port}/graphql`);
  });
  server.on('error', (e) => {
    log.fatal('Express Server on error handler', e);
  });
}

async function seedTestData() {
  await bootstrapMongoDB();
  await testDbSeed();
}

const argv = command('testseed', 'Perform test-db-seed').help().alias('help', 'h').argv;
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
//@ts-ignore
if (argv._.includes('testseed')) {
  seedTestData()
    .then(() => {
      log.info({}, 'test-db-seed completed');
      process.exit(0);
    })
    .catch((e) => log.fatal('test-db-seed failed', e));
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
