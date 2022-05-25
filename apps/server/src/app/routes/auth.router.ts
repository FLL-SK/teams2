import { logger } from '@teams2/logger';
import express = require('express');
import passport = require('passport');
import { AuthUser, createToken, verifyToken } from '../auth';
import { messageFromTemplate } from '../templates';
import { sendHtmlEmail } from '../utils/mailer';

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

router.post('/', function (req, res, next) {
  passport.authenticate('login', { session: false }, (err: Error, user?: AuthUser) => {
    const log = logLib.extend('post/');
    log.debug('authenticating user=%o', user);

    if (err || !user) {
      log.debug('login failed for user=%o err=%o', user, err);
      return res.status(401).json({ error: { message: 'Invalid username or password' } });
    }

    req.login(user, { session: false }, (err) => {
      // EXAMPLE: this is email example
      sendHtmlEmail(
        ['test@test.test'],
        'Welcome to Teams2',
        messageFromTemplate('Huhuuuuuuuu', 'Welcome to Teams2')
      );
      return login(user, res, err);
    });
  })(req, res);
});
