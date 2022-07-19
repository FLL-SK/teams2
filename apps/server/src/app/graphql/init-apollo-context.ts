import { ExpressContext } from 'apollo-server-express';
import { userRepository } from '../models';
import { UserGuard } from '../utils/user-guard';
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
  if (!user) {
    return { ...apolloContextEmpty };
  }

  return {
    user: { ...user.toObject() },
    userGuard: new UserGuard(user),
    userTimeZone: 'Europe/Bratislava',
    authProfileData: profileData,
  };
}
