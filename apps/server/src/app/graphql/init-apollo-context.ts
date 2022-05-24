import { ExpressContext } from 'apollo-server-express';
import { UserDataSource } from '../datasources';
import { ApolloContext, apolloContextEmpty, AuthProfileData } from './apollo-context';

export async function initApolloContext(cfg: ExpressContext): Promise<ApolloContext> {
  const { req } = cfg;

  if (!req.user) {
    return { ...apolloContextEmpty };
  }

  const profileData: AuthProfileData = {
    email: req.user ?? '',
  };

  const user = await UserDataSource.getUserByUsername(profileData.email);

  return {
    user: user,
    userTimeZone: 'Europe/Bratislava',
    authProfileData: profileData,
  };
}
