import express from 'express';
import path from 'path';
import authRouter from './auth.router';
import paymentCbRouter from './payment-cb.router';

const rootRouter = express.Router();

export const buildRootRouter = () => {
  rootRouter.use('/public', express.static(path.join(__dirname, 'assets')));
  rootRouter.use('/auth', authRouter);
  rootRouter.use('/payment-cb', paymentCbRouter);
  return rootRouter;
};
