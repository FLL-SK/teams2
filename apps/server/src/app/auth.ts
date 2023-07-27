import passport from 'passport';
import { sign, verify } from 'jsonwebtoken';
import { compare } from 'bcryptjs';
import { Strategy as PassportLocalStrategy } from 'passport-local';
import { ExtractJwt, Strategy as PassportJwtStrategy } from 'passport-jwt';

import { Application } from 'express';
import { userRepository } from './models';

import { logger } from '@teams2/logger';
import { getServerConfig } from '../server-config';
import { ObjectId } from 'mongodb';
const logLib = logger('auth');

export interface AuthUser {
  id?: ObjectId;
  username: string;
}

export function authenticateUsingJwt() {
  return passport.authenticate('jwt', { session: false });
}

export function createToken(data: AuthUser) {
  return sign(data, getServerConfig().jwt.secret, { expiresIn: '1d' });
}

export function createPasswordResetToken(username: string) {
  const au: AuthUser = { username };
  return sign(au, getServerConfig().jwt.secret, { expiresIn: '1h' });
}

export function verifyToken(token: string): AuthUser | null {
  const log = logLib.extend('login');
  let ret: any;
  try {
    ret = verify(token, getServerConfig().jwt.secret);
    log.debug('Token data type:%s data:%O', typeof ret, ret);
  } catch (err) {
    log.debug('Wrong token provided.');
  }
  const au: AuthUser = typeof ret === 'object' ? { id: ret.id, username: ret.username } : null;
  return au;
}

const passportLoginStrategy = new PassportLocalStrategy(
  {
    usernameField: 'username',
    passwordField: 'password',
  },
  async function (
    username: string,
    password: string,
    cb: (err: Error, user?: AuthUser | boolean) => void
  ) {
    const log = logLib.extend('login');
    log.debug('Authenticating using username=%s password=%s', username, password);
    try {
      const user = await userRepository.findActiveByUsername(username);
      if (!user) {
        log.debug('User not found.');
        return cb(null, false);
      } else if (!(await compare(password, user.password))) {
        log.debug('Wrong password.');
        return cb(null, false);
      }
      log.debug('User logged in user=%O', user);
      const au: AuthUser = { id: user._id, username: user.username };
      return cb(null, au);
    } catch (err) {
      log.error('Error %O', err);
      return cb(new Error('Auth server error'), null);
    }
  }
);

const passportJwtAuthStrategy = new PassportJwtStrategy(
  {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: getServerConfig().jwt.secret,
  },
  async function (payload: any, cb: (err: Error, user?: AuthUser | boolean) => void) {
    const log = logLib.extend('jwt');
    try {
      log.debug('Authenticating using JWT=%o', payload);
      const u = await userRepository
        .findOne({ _id: payload.id, recordActive: true })
        .select({ password: 0 })
        .lean()
        .exec();

      if (!u) return cb(null, false);

      log.debug('Authenticated OK');
      const au: AuthUser = { id: u._id, username: u.username };
      return cb(null, au);
    } catch (err) {
      return cb(err);
    }
  }
);

const passportSignupStrategy = new PassportLocalStrategy(
  {
    usernameField: 'username',
    passwordField: 'password',
  },
  async (
    username: string,
    password: string,
    cb: (err: Error, user?: AuthUser | boolean) => void
  ) => {
    const log = logLib.extend('signup');
    try {
      log.info('Signup user:%s', username);
      //Save the information provided by the user to the the database
      const user = await userRepository.create({ username, password });
      const au: AuthUser = { id: user._id, username: user.username };
      //Send the user information to the next middleware
      return cb(null, au);
    } catch (error) {
      cb(error);
    }
  }
);

export function configure(app: Application) {
  //Create a passport middleware to handle user registration
  logLib.debug('Configuring passport');
  passport.use('signup', passportSignupStrategy);
  passport.use('login', passportLoginStrategy);
  passport.use('jwt', passportJwtAuthStrategy);

  app.use(passport.initialize());
}
