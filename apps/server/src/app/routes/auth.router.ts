import { logger } from '@teams2/logger';
import express = require('express');
import passport = require('passport');
import { AuthUser, createToken, verifyToken } from '../auth';
import { userRepository } from '../models';
import { requestPassworReset as requestPassworReset } from '../utils/password-reset';

const router = express.Router();
export default router;

const logLib = logger('rt-auth');

const login = (user: AuthUser, res: express.Response, err?: Error) => {
  logLib.debug('login OK');
  if (err) {
    logLib.debug('error=%o', err);
    return res.json(err);
  }

  const token = createToken(user);

  res.cookie('refreshToken', token, { maxAge: 43200000, httpOnly: true }); // valid for 30 days
  return res.json({ user, token });
};

router.get('/', (req, res) => {
  const token = (req.query.token as string) ?? 'undefined';
  const log = logLib.extend('verify');
  const au = verifyToken(token);
  log.debug('token=%s au=%o', token, au);
  if (au) {
    log.info('Authenticated %o', au);
    return login(au, res);
  }
  res.send({ error: { message: 'Invalid token' } });
});

router.post('/forgot', async function (req, res, next) {
  const { username } = req.body;
  const log = logLib.extend('post/forgot');
  log.debug('user forgot password=%o', username);

  const u = await userRepository.findActiveByUsername(username);
  if (u) {
    requestPassworReset(username);
  } else {
    log.debug('user not found', username);
  }

  res.send({});
});

router.post('/reset', async function (req, res, next) {
  const { token, password } = req.body;
  const log = logLib.extend('post/reset');

  const au = verifyToken(token);
  log.debug('user password reset=%o pwd=%s token=%s', au, password, token);

  const u = await userRepository.findActiveByUsername(au.username);
  if (u) {
    u.password = password;
    await u.save();
    return res.send({});
  }
  res.status(401).send({ error: { message: 'Invalid token' } });
});

router.post('/signup', async function (req, res, next) {
  const { username, password } = req.body;
  const log = logLib.extend('post/signup');
  log.debug('user signup=%o', username);

  const u = await userRepository.findActiveByUsername(username);
  if (u) {
    return res.status(400).send({ error: { message: 'User already exists' } });
  } else {
    log.info('New signup', username);
    await userRepository.create({ username, password });
  }

  res.send({});
});

router.post('/', function (req, res, next) {
  passport.authenticate('login', { session: false }, (err: Error, user?: AuthUser) => {
    const log = logLib.extend('post/');
    log.debug('authenticating user=%o', user);

    if (err || !user) {
      log.debug('login failed for user=%o err=%o', user, err);
      return res.status(401).json({ error: { message: 'Invalid username or password' } });
    }

    req.login(user, { session: false }, (err) => {
      return login(user, res, err);
    });
  })(req, res);
});
