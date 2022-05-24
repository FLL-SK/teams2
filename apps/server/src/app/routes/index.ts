import * as express from 'express';
import path = require('path');
import authRouter from './auth.router';

const rootRouter = express.Router();

export const buildRootRouter = () => {
  rootRouter.use('/public', express.static(path.join(__dirname, 'assets')));
  rootRouter.use('/auth', authRouter);
  return rootRouter;
};
