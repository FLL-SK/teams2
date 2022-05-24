import * as express from 'express';
import authRouter from './auth.router';

const rootRouter = express.Router();

export const buildRootRouter = () => {
  rootRouter.use('/auth', authRouter);
  return rootRouter;
};
