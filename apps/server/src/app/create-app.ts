import cors from 'cors';
import passport from 'passport';
import express, { Express } from 'express';
import { logger } from '@teams2/logger';
import { configureAuth } from './configure-auth';
import { getServerConfig } from '../server-config';
import { bootstrapApolloServer } from './apollo/bootstrap-apollo-server';
import { buildRootRouter } from './routes';
import { initSettingsLoader } from './utils/settings';
import { requestLogger } from './utils/request-log';

const log = logger('app');

export interface CreateAppOptions {
  /** adresár so statickými súbormi servera (logo, …) */
  assetsPath?: string;
  /** logovanie HTTP požiadaviek (morgan) – v testoch vypnuté */
  logRequests?: boolean;
}

/**
 * Zostaví Express aplikáciu (CORS, autentifikácia, REST routy, GraphQL).
 * Nepripája sa k DB ani nespúšťa HTTP server – to robí volajúci (main.ts, testy).
 */
export async function createApp(options: CreateAppOptions = {}): Promise<Express> {
  const { assetsPath, logRequests = true } = options;
  const app = express();

  if (logRequests) {
    // bez query stringu – môže obsahovať tokeny a tajné kľúče (#282)
    app.use(requestLogger());
  }

  // CORS configuration
  const corsOptions = {
    origin: getServerConfig().clientAppRootUrlsForCORS,
    preflightContinue: false,
    credentials: false,
    // methods: 'GET,HEAD,PUT,PATCH,POST,DELETE, OPTIONS'
  };
  log.info('Configuring CORS ... %o', corsOptions);
  app.use(cors(corsOptions));

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

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
        log.warn('Unauthorized request /graphql from ip=%s', req.ip ?? '-');

        return res.status(401).send('Unauthorized');
      }

      next();
    })(req, res, next);
  });

  app.use('/graphql', graphQlMW);

  if (assetsPath) {
    app.use(express.static(assetsPath));
  }

  // initialize system loaders
  initSettingsLoader();

  return app;
}
