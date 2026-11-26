import { MIN_PASSWORD_LENGTH, validateEmail, validatePassword } from '@teams2/common';
import { logger } from '@teams2/logger';
import express from 'express';
import passport from 'passport';
import { rateLimit, RateLimitRequestHandler } from 'express-rate-limit';
import { UserData, userRepository } from '../models';
import { emailUserSignupToAdmin, emailUserSignupToUser } from '../utils/emails';
import { getActiveUserPasswordHash, requestPasswordReset } from '../utils/password-reset';
import { AuthUser, createToken, verifyPasswordResetToken, verifyToken } from '@teams2/auth-node';
import { verifyUserName } from '../configure-auth';

const router = express.Router();
export default router;

const logLib = logger('rt-auth');

const MINUTE = 60 * 1000;

const limiter = (windowMs: number, limit: number, skipSuccessfulRequests = false) =>
  rateLimit({
    windowMs,
    limit,
    skipSuccessfulRequests,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    message: { error: { message: 'Príliš veľa pokusov. Skúste to znova neskôr.' } },
  });

/**
 * Obmedzenie počtu požiadaviek na /auth z jednej IP adresy (#281).
 * Pri prihlásení sa počítajú iba neúspešné pokusy (tréneri zo školy môžu zdieľať IP).
 * Za reverznou proxy musí byť nastavené `trust proxy` (pozri main.ts), inak by všetci zdieľali IP proxy.
 */
export const authRateLimiters: Record<
  'login' | 'forgot' | 'reset' | 'signup',
  RateLimitRequestHandler
> = {
  login: limiter(15 * MINUTE, 20, true),
  forgot: limiter(15 * MINUTE, 5),
  reset: limiter(15 * MINUTE, 10),
  signup: limiter(60 * MINUTE, 20),
};

const isNonEmptyString = (v: unknown): v is string => typeof v === 'string' && v.length > 0;
const isOptionalString = (v: unknown): v is string | undefined | null =>
  v === undefined || v === null || typeof v === 'string';

const passwordPolicyMessage = `Heslo musí mať aspoň ${MIN_PASSWORD_LENGTH} znakov.`;

/**
 * Vydá prihlasovací token.
 * @param authTime čas pôvodného prihlásenia heslom (pri obnove tokenu sa zachová)
 */
const login = (user: AuthUser, res: express.Response, authTime?: number) => {
  logLib.debug('login OK');
  try {
    const u: Pick<UserData, 'username'> = {
      username: user.username,
    };
    if (authTime === undefined) {
      // nové prihlásenie heslom
      const uq: Partial<UserData> = { lastLoginOn: new Date() };
      void userRepository.findOneAndUpdate(u, uq).exec();
    }
    const token = createToken(user, authTime);
    return res.json({ user: { id: user.id, username: user.username }, token });
  } catch (e) {
    logLib.error('login error=%o', e);
    res.status(500).send({ error: { message: 'Internal error. Login failed.' } });
  }
};

/** token z hlavičky `Authorization: Bearer …`, kvôli starším klientom aj z `?token=` */
const tokenFromRequest = (req: express.Request): string | null => {
  const auth = req.get('authorization');
  if (auth?.startsWith('Bearer ')) {
    return auth.slice('Bearer '.length).trim();
  }
  return isNonEmptyString(req.query.token) ? req.query.token : null;
};

// obnova prihlasovacieho tokenu
router.get('/', async (req, res) => {
  const log = logLib.extend('verify');
  const token = tokenFromRequest(req);
  const au = token ? verifyToken(token) : null;
  // používateľ musí stále existovať a token nesmie byť starší ako posledná zmena hesla
  const user = au ? await verifyUserName(au.username ?? '', au) : null;
  log.debug('au=%o', au);
  if (au && user) {
    log.info('Authenticated %s', user.username);
    return login(user, res, au.authTime);
  }
  res.send({ error: { message: 'Invalid token' } });
});

router.post('/forgot', authRateLimiters.forgot, async function (req, res) {
  const { username } = req.body ?? {};
  const log = logLib.extend('post/forgot');

  try {
    if (isNonEmptyString(username)) {
      const u = await userRepository.findActiveByUsername(username);
      if (u) {
        requestPasswordReset(u);
      } else {
        log.debug('user not found');
      }
    }
  } catch (e) {
    log.error('forgot password error=%o', e);
  }

  // odpoveď je vždy rovnaká – neprezrádza, či účet existuje
  res.send({});
});

router.post('/reset', authRateLimiters.reset, async function (req, res) {
  const { token, password } = req.body ?? {};
  const log = logLib.extend('post/reset');

  const username = await verifyPasswordResetToken(token, getActiveUserPasswordHash);
  log.debug('user password reset=%s', username);
  if (!username) {
    return res.status(401).send({ error: { message: 'Invalid token' } });
  }
  if (!validatePassword(password)) {
    return res.status(400).send({ error: { message: passwordPolicyMessage } });
  }

  const u = await userRepository.findActiveByUsername(username);
  if (!u) {
    return res.status(401).send({ error: { message: 'Invalid token' } });
  }
  u.password = password; // zahashuje hook pre('save') a nastaví passwordChangedOn
  await u.save();
  return res.send({});
});

router.post('/signup', authRateLimiters.signup, async function (req, res) {
  const { username, password, firstName, lastName, phone, gdprAccepted } = req.body ?? {};
  const log = logLib.extend('post/signup');

  if (!gdprAccepted) {
    return res.status(403).send({ error: { message: 'GDPR not accepted' } });
  }
  if (
    !isNonEmptyString(username) ||
    !isOptionalString(firstName) ||
    !isOptionalString(lastName) ||
    !isOptionalString(phone)
  ) {
    return res.status(400).send({ error: { message: 'Nesprávne vstupy.' } });
  }
  if (!validateEmail(username)) {
    return res.status(400).send({ error: { message: 'Username shall be valid email address.' } });
  }
  if (!validatePassword(password)) {
    return res.status(400).send({ error: { message: passwordPolicyMessage } });
  }

  // aj zmazaný účet blokuje username (unikátny index)
  const u = await userRepository.findByUsername(username);
  if (u) {
    return res.status(400).send({ error: { message: 'User already exists' } });
  }

  log.info('New signup %s', username);
  const nu: UserData = {
    username,
    password,
    firstName,
    lastName,
    phone,
    createdOn: new Date(),
    gdprAcceptedOn: new Date(),
  };
  try {
    await userRepository.create(nu);
  } catch (e) {
    if ((e as { code?: number }).code === 11000) {
      return res.status(400).send({ error: { message: 'User already exists' } });
    }
    throw e;
  }
  emailUserSignupToAdmin(username);
  emailUserSignupToUser(username);

  res.send({});
});

router.post('/', authRateLimiters.login, function (req, res) {
  passport.authenticate('login', { session: false }, (err: Error, user?: AuthUser) => {
    const log = logLib.extend('post/');

    if (err || !user) {
      log.debug('login failed err=%o', err);
      return res.status(401).json({ error: { message: 'Invalid username or password' } });
    }

    return login(user, res);
  })(req, res);
});
