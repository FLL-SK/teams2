import * as passport from 'passport';
import { Algorithm, decode, sign, verify, JwtPayload } from 'jsonwebtoken';
import { Strategy as PassportLocalStrategy } from 'passport-local';
import { ExtractJwt, Strategy as PassportJwtStrategy } from 'passport-jwt';

import { Application } from 'express';
import {
  AuthUser,
  LoginOkFn,
  SecretGetterFn,
  TokenPurpose,
  VerifiedAuthUser,
  VerifyUserIdFn,
  VerifyUserLoginFn,
} from './types';
import { debugLib } from './_debug';

export let secretGetterFn: SecretGetterFn = () => 'no-secrets';
export let verifyUserLoginFn: VerifyUserLoginFn | null = null;
export let verifyUserNameFn: VerifyUserIdFn | null = null;
export let loginOkFn: LoginOkFn | null | undefined = null;

const debug = debugLib.extend('passport');

export function authenticateUsingJwt() {
  return passport.authenticate('jwt', { session: false });
}

/** maximálna doba od prihlásenia heslom, počas ktorej sa dá token obnovovať (sekundy) */
export const MAX_SESSION_AGE_SECONDS = 30 * 24 * 60 * 60;

const JWT_ALGORITHMS: Algorithm[] = ['HS256'];

interface LoginTokenPayload extends JwtPayload {
  username?: string | null;
  id?: string | null;
  purpose?: TokenPurpose;
  auth_time?: number;
}

const nowSeconds = () => Math.floor(Date.now() / 1000);

/**
 * Vytvorí prihlasovací token (platný 1 deň).
 * @param authTime čas pôvodného prihlásenia heslom – pri obnove tokenu sa zachová,
 *   aby sa relácia nedala predlžovať donekonečna
 */
export function createToken(data: AuthUser, authTime?: number) {
  const payload: LoginTokenPayload = {
    username: data.username,
    id: data.id,
    purpose: 'login',
    auth_time: authTime ?? nowSeconds(),
  };
  return sign(payload, secretGetterFn(), { expiresIn: '1d', algorithm: 'HS256' });
}

/**
 * Overí prihlasovací token. Iný token (reset hesla, token bez účelu z pôvodnej verzie,
 * token po uplynutí MAX_SESSION_AGE_SECONDS od prihlásenia) vráti `null`. #281
 */
export function verifyToken(token: string): VerifiedAuthUser | null {
  let ret: LoginTokenPayload | string | null = null;
  try {
    ret = verify(token, secretGetterFn(), { algorithms: JWT_ALGORITHMS }) as LoginTokenPayload;
  } catch {
    debug('Wrong token provided.');
    return null;
  }
  return toVerifiedUser(ret);
}

function toVerifiedUser(ret: LoginTokenPayload | string | null): VerifiedAuthUser | null {
  if (!ret || typeof ret !== 'object' || ret.purpose !== 'login') {
    return null;
  }
  if (typeof ret.iat !== 'number' || typeof ret.auth_time !== 'number') {
    return null;
  }
  if (nowSeconds() - ret.auth_time > MAX_SESSION_AGE_SECONDS) {
    debug('Session too old.');
    return null;
  }
  return { username: ret.username, id: ret.id, issuedAt: ret.iat, authTime: ret.auth_time };
}

/**
 * Secret tokenu na reset hesla je odvodený od aktuálneho hashu hesla –
 * po zmene hesla je token neplatný (jednorazový) a nedá sa overiť ako prihlasovací token.
 */
const resetSecret = (passwordHash: string) => `${secretGetterFn()}:reset:${passwordHash}`;

/** vytvorí jednorazový token na reset hesla (platný 1 hodinu) */
export function createPasswordResetToken(username: string, passwordHash: string) {
  return sign({ username, purpose: 'reset' satisfies TokenPurpose }, resetSecret(passwordHash), {
    expiresIn: '1h',
    algorithm: 'HS256',
  });
}

/**
 * Overí token na reset hesla.
 * @param getPasswordHash vráti aktuálny hash hesla aktívneho používateľa (alebo `null`)
 * @returns username, ak je token platný
 */
export async function verifyPasswordResetToken(
  token: unknown,
  getPasswordHash: (username: string) => Promise<string | null | undefined>,
): Promise<string | null> {
  if (typeof token !== 'string' || !token) {
    return null;
  }
  const decoded = decode(token);
  if (!decoded || typeof decoded !== 'object' || decoded.purpose !== 'reset') {
    return null;
  }
  const username = decoded.username;
  if (typeof username !== 'string' || !username) {
    return null;
  }
  const hash = await getPasswordHash(username);
  if (!hash) {
    return null;
  }
  try {
    const ret = verify(token, resetSecret(hash), { algorithms: JWT_ALGORITHMS }) as JwtPayload;
    return ret.purpose === 'reset' && ret.username === username ? username : null;
  } catch {
    debug('Wrong password reset token.');
    return null;
  }
}

const passportLoginStrategy = () => {
  return new PassportLocalStrategy(
    {
      usernameField: 'username',
      passwordField: 'password',
    },
    async function (
      username: string,
      password: string,
      cb: (err: Error | null, user?: AuthUser | boolean) => void,
    ) {
      try {
        if (!verifyUserLoginFn) {
          throw new Error('verifyUserLoginFn not set');
        }
        const user = await verifyUserLoginFn(username, password);
        if (!user) {
          debug('local: User not found or wrong password.');
          return cb(null, false);
        }
        return cb(null, user);
      } catch {
        return cb(new Error('Auth server error'), false);
      }
    },
  );
};

const passportJwtAuthStrategy = () => {
  return new PassportJwtStrategy(
    {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: secretGetterFn(),
      algorithms: JWT_ALGORITHMS,
    },
    async function (
      payload: LoginTokenPayload,
      cb: (err: Error | null, user?: AuthUser | boolean) => void,
    ) {
      try {
        // iba prihlasovací token – nie token na reset hesla ani token bez účelu
        const token = toVerifiedUser(payload);
        if (!token) {
          debug('JWT: Not a valid login token.');
          return cb(null, false);
        }
        if (!verifyUserNameFn) {
          throw new Error('verifyUserIdFn not set');
        }
        const user = await verifyUserNameFn(token.username ?? '', {
          issuedAt: token.issuedAt,
          authTime: token.authTime,
        });

        if (!user) {
          debug('JWT: User not found.');
          return cb(null, false);
        }

        debug('JWT: Authenticated OK');

        return cb(null, user);
      } catch (e) {
        return cb(e as Error, false);
      }
    },
  );
};

/**
 * Configure passport-jwt-auth
 * @param app express app
 * @param secretGetter function which should return the secret
 * @param verifyUserLogin function which should verify the user login
 * @param verifyUserId function which should verify the user id
 * @param loginOk callbeck function which is called after login is ok
 */
export function configure(
  app: Application,
  secretGetter: SecretGetterFn,
  verifyUserLogin: VerifyUserLoginFn,
  verifyUserId: VerifyUserIdFn,
  loginOk?: LoginOkFn,
) {
  secretGetterFn = secretGetter;
  verifyUserLoginFn = verifyUserLogin;
  verifyUserNameFn = verifyUserId;
  loginOkFn = loginOk;

  passport.use('login', passportLoginStrategy());
  passport.use('jwt', passportJwtAuthStrategy());

  app.use(passport.initialize());
}
