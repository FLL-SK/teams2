import { validateEmail } from '@teams2/common';
import { logger } from '@teams2/logger';
import express from 'express';
import passport from 'passport';
import { AuthUser, createToken, verifyToken } from '../auth';
import { UserData, userRepository } from '../models';
import { emailUserSignupToAdmin, emailUserSignupToUser } from '../utils/emails';
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
  try {
    const u: Pick<UserData, 'username'> = {
      username: user.username,
    };
    const uq: Partial<UserData> = { lastLoginOn: new Date() };
    userRepository.findOneAndUpdate(u, uq).exec();
    const token = createToken(user);

    res.cookie('refreshToken', token, { maxAge: 43200000, httpOnly: true }); // valid for 30 days
    return res.json({ user, token });
  } catch (e) {
    logLib.error('login error=%o', e);
    res.status(500).send({ error: { message: 'Internal error. Login failed.' } });
  }
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

router.post('/forgot', async function (req, res) {
  const { username } = req.body;
  const log = logLib.extend('post/forgot');
  log.debug('user forgot password=%o', username);

  try {
    const u = await userRepository.findActiveByUsername(username);
    if (u) {
      requestPassworReset(username);
    } else {
      log.debug('user not found', username);
    }
  } catch (e) {
    log.error('forgot password error=%o', e);
  }

  res.send({});
});

router.post('/reset', async function (req, res) {
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

router.post('/signup', async function (req, res) {
  const { username, password, firstName, lastName, phone, gdprAccepted } = req.body;
  const log = logLib.extend('post/signup');
  log.debug('user signup=%o', username);

  if (!gdprAccepted) {
    return res.status(403).send({ error: { message: 'GDPR not accepted' } });
  }

  const u = await userRepository.findActiveByUsername(username);
  if (u) {
    return res.status(400).send({ error: { message: 'User already exists' } });
  } else {
    log.info('New signup', username);
    if (!validateEmail(username)) {
      return res.status(400).send({ error: { message: 'Username shall be valid email address.' } });
    }
    const nu: UserData = {
      username,
      password,
      firstName,
      lastName,
      phone,
      createdOn: new Date(),
      gdprAcceptedOn: new Date(),
    };
    await userRepository.create(nu);
    emailUserSignupToAdmin(username);
    emailUserSignupToUser(username);
  }

  res.send({});
});

router.post('/', function (req, res) {
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
