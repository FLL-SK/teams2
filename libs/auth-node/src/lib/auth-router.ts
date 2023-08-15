import * as express from 'express';
import * as passport from 'passport';
import { createToken, loginOkFn, verifyToken } from './passport-jwt-auth';
import { debugLib } from './_debug';
import { AuthUser } from './types';

const router:express.Router = express.Router();
export default router;

const debug = debugLib.extend('router');

const login = (user: AuthUser, res: express.Response, err?: Error) => {
  debug('login: login OK');
  if (err) {
    debug('login: error=%o', err);
    return res.json(err);
  }
  try {
    if (loginOkFn) {
      loginOkFn(user);
    }
    const token = createToken(user);
    res.cookie('refreshToken', token, { maxAge: 43200000, httpOnly: true }); // valid for 30 days
    return res.json({ user, token });
  } catch (e) {
    debug('login: error=%o', e);
    res.status(500).send({ error: { message: 'Internal error. Login failed.' } });
  }
};

router.get('/', (req, res) => {
  const token = (req.query.token as string) ?? 'undefined';

  const au = verifyToken(token);
  debug('verify: token=%s au=%o', token, au);
  if (au) {
    debug('Authenticated %o', au);
    return login(au, res);
  }
  debug('Invalid token');
  res.send({ error: { message: 'Invalid token' } });
});

router.post('/', function (req, res) {
  debug('login: req.body=%o', req.body);
  passport.authenticate('login', { session: false }, (err: Error, user?: AuthUser) => {
    debug('authenticating user=%o', user);

    if (err || !user) {
      debug('login failed for user=%o err=%o', user, err);
      return res.status(401).json({ error: { message: 'Invalid username or password' } });
    }

    debug('logging in user=%o', user);
    req.login(user, { session: false }, (err) => {
      return login(user, res, err);
    });
  })(req, res);
});
