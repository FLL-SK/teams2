import { ExpressContext } from 'apollo-server-express';
import { UserDataSource } from '../datasources';
import { userRepository } from '../models';
import { ApolloContext, apolloContextEmpty, AuthProfileData } from './apollo-context';

export async function initApolloContext(cfg: ExpressContext): Promise<ApolloContext> {
  const { req } = cfg;
  console.log('initApolloContext', req.session, req.user);

  if (!req.user) {
    return { ...apolloContextEmpty };
  }

  const profileData: AuthProfileData = {
    email: req.user?.username ?? '',
  };

  console.log('profileData', profileData);
  const user = await userRepository.findByUsername(profileData.email);

  return {
    user: user,
    userTimeZone: 'Europe/Bratislava',
    authProfileData: profileData,
  };
}
