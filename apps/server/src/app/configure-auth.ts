import { AuthUser, configure } from '@teams2/auth-node';
import { Application } from 'express';

import { compareHash } from './utils/hash-password';
import { UserData, userRepository } from './models';
import { getServerConfig } from '../server-config';

import debugLib from 'debug';

const debug = debugLib('auth:configure');

const verifyLogin = async (username: string, password: string): Promise<AuthUser> => {
  debug('Authenticating user. username=%s', username);
  const user = await userRepository.findActiveByUsername(username);
  debug('user: %o', user);
  if (!user || !(await compareHash(password, user.password))) {
    return null;
  }
  return { id: user._id.toString(), username: user.username };
};

const verifyUserName = async (userame: string): Promise<AuthUser> => {
  debug('Verifying user. userId=%s', userame);

  const user = await userRepository.findActiveByUsername(userame);
  if (!user) {
    return null;
  }
  return { id: user._id.toString(), username: user.username };
};

const loginOk = async (user: AuthUser) => {
  const u: Pick<UserData, 'username'> = {
    username: user.username,
  };
  const uq: Partial<UserData> = { lastLoginOn: new Date() };
  await userRepository.findOneAndUpdate(u, uq).exec();
};

export const configureAuth = (app: Application) => {
  configure(app, () => getServerConfig().jwt.secret, verifyLogin, verifyUserName, loginOk);
};
