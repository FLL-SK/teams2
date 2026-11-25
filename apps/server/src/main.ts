import dotenv from 'dotenv';
dotenv.config({ quiet: true });

import path from 'node:path';
import yargs from 'yargs';
import { getServerConfig } from './server-config';
import { bootstrapMongoDB, testDbSeed } from './app/db';
import { createApp } from './app/create-app';
import { logger } from '@teams2/logger';

const log = logger('main');

async function server() {
  const port = getServerConfig().port;
  log.info('Starting server ...');
  log.info('Config: %o', getServerConfig());
  log.info(`Environment: ${process.env.NODE_ENV}`);
  log.info(`Debug: ${process.env.DEBUG}`);

  await bootstrapMongoDB();

  const app = await createApp({ assetsPath: path.join(__dirname, 'assets') });

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

const argv = yargs().command('testseed', 'Perform test-db-seed').help().alias('help', 'h').argv;
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
