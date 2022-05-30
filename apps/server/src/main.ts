import * as express from 'express';
import * as cors from 'cors';
import * as morgan from 'morgan';
import { command } from 'yargs';
import { configure as configureAuth } from './app/auth';

import { loadDotEnvFiles } from './app/utils/env-loader';
import { getServerConfig } from './server-config';
import { bootstrapMongoDB, dbSeed } from './app/db';
import { bootstrapApolloServer } from './app/graphql/bootstrap-apollo-server';

import { logger } from '@teams2/logger';
import { buildRootRouter } from './app/routes';
const log = logger('main');

loadDotEnvFiles();

async function server() {
  const port = getServerConfig().port;
  log.info('Starting server ...', { appConfig: getServerConfig() });
  log.info(`Environment: ${process.env.NODE_ENV}`);
  const app = express();

  // CORS configuration
  const corsOptions = {
    origin: ['http://localhost:5000', 'http://localhost:4200'],
    preflightContinue: true,
    credentials: true,
    // methods: 'GET,HEAD,PUT,PATCH,POST,DELETE, OPTIONS'
  };

  app.use(morgan('tiny'));
  app.use(cors(corsOptions));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  await bootstrapMongoDB();

  // configure passport authentication
  configureAuth(app);

  await bootstrapApolloServer(app);

  const assetsPath = __dirname + '/assets';
  app.use(express.static(assetsPath));

  const rootRouter = buildRootRouter();
  app.use('/', rootRouter);

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
