import { AuthTokenInfo, AuthUser, configure } from '@teams2/auth-node';
import { Application } from 'express';

import { compareHash } from './utils/hash-password';
import { UserData, userRepository } from './models';
import { getServerConfig } from '../server-config';

import debugLib from 'debug';

const debug = debugLib('auth:configure');

const verifyLogin = async (username: string, password: string): Promise<AuthUser> => {
  debug('Authenticating user. username=%s', username);
  if (typeof username !== 'string' || typeof password !== 'string') {
    return null;
  }
  const user = await userRepository.findActiveByUsername(username);
  if (!user || !(await compareHash(password, user.password))) {
    return null;
  }
  return { id: user._id.toString(), username: user.username };
};

/**
 * Prihlasovací token vydaný pred poslednou zmenou hesla je neplatný (#281).
 * Porovnáva sa v celých sekundách (`iat` je v sekundách), aby token vydaný hneď po zmene hesla platil.
 */
export function isTokenIssuedBeforePasswordChange(
  user: Pick<UserData, 'passwordChangedOn'>,
  token?: Pick<AuthTokenInfo, 'issuedAt'>,
): boolean {
  if (!user.passwordChangedOn || !token) {
    return false;
  }
  return token.issuedAt < Math.floor(user.passwordChangedOn.getTime() / 1000);
}

export const verifyUserName = async (
  username: string,
  token?: AuthTokenInfo,
): Promise<AuthUser> => {
  debug('Verifying user. username=%s', username);

  const user = await userRepository.findActiveByUsername(username);
  if (!user || isTokenIssuedBeforePasswordChange(user, token)) {
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
