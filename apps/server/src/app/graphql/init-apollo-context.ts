import { ExpressContext } from 'apollo-server-express';
import { userRepository } from '../models';
import { ApolloContext, apolloContextEmpty, AuthProfileData } from './apollo-context';

export async function initApolloContext(cfg: ExpressContext): Promise<ApolloContext> {
  const { req } = cfg;

  if (!req.user) {
    return { ...apolloContextEmpty };
  }

  const profileData: AuthProfileData = {
    email: req.user?.username ?? '',
  };

  const user = await userRepository.findByUsername(profileData.email);

  return {
    user: user,
    userTimeZone: 'Europe/Bratislava',
    authProfileData: profileData,
  };
}
