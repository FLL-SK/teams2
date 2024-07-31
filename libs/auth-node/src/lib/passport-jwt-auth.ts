import * as passport from 'passport';
import { sign, verify, JwtPayload } from 'jsonwebtoken';
import { Strategy as PassportLocalStrategy } from 'passport-local';
import { ExtractJwt, Strategy as PassportJwtStrategy } from 'passport-jwt';

import { Application } from 'express';
import { AuthUser, LoginOkFn, SecretGetterFn, VerifyUserIdFn, VerifyUserLoginFn } from './types';
import { debugLib } from './_debug';

export const passportJwtAuth = () => 'passport-jwt-auth';

export let secretGetterFn: SecretGetterFn = () => 'no-secrets';
export let verifyUserLoginFn: VerifyUserLoginFn | null = null;
export let verifyUserNameFn: VerifyUserIdFn | null = null;
export let loginOkFn: LoginOkFn | null | undefined = null;

const debug = debugLib.extend('passport');

export function authenticateUsingJwt() {
  return passport.authenticate('jwt', { session: false });
}

export function createToken(data: AuthUser) {
  return sign(data, secretGetterFn(), { expiresIn: '1d' });
}

export function createPasswordResetToken(username: string) {
  const au: AuthUser = { username };
  return sign(au, secretGetterFn(), { expiresIn: '1h' });
}

export function verifyToken(token: string): AuthUser | null {
  let ret: (JwtPayload & Partial<AuthUser>) | string | null = null;
  try {
    ret = verify(token, secretGetterFn());
  } catch (err) {
    debug('Wrong token provided.');
  }
  debug('verifyToken: ret=%o', ret);
  const au: AuthUser | null =
    ret && typeof ret === 'object' ? { username: ret?.username, id: ret?.id } : null;
  return au;
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
      } catch (err) {
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
    },
    async function (payload: AuthUser, cb: (err: Error | null, user?: AuthUser | boolean) => void) {
      try {
        debug('Authenticating using JWT=', JSON.stringify(payload));
        if (!verifyUserNameFn) {
          throw new Error('verifyUserIdFn not set');
        }
        const user = await verifyUserNameFn(payload.username ?? '');

        if (!user) {
          debug('JWT: User not found.');
          console.warn('JWT: User not found.');
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
