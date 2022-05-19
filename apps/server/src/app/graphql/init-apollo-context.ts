import { ExpressContext } from 'apollo-server-express';
import { getAppConfig } from '../../app-config';
import { UserDataSource } from '../datasources';
import {
  ApolloContext,
  apolloContextEmpty,
  AuthProfileData,
} from './apollo-context';

export async function initApolloContext(
  cfg: ExpressContext
): Promise<ApolloContext> {
  const { req } = cfg;
  const appConfig = getAppConfig();

  if (!req.user) {
    return { ...apolloContextEmpty };
  }

  const profileData: AuthProfileData = {
    email: req.user[appConfig.auth0.namespace + 'email'] ?? '',
    email_verified:
      req.user[appConfig.auth0.namespace + 'email_verified'] ?? false,
    picture: req.user[appConfig.auth0.namespace + 'picture'] ?? null,
  };

  const user = await UserDataSource.getUserByUsername(profileData.email);

  return {
    user: user,
    userVerified: profileData.email_verified,
    userTimeZone: 'Europe/Bratislava',
    authProfileData: profileData,
  };
}
