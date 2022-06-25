import { ExpressContext } from 'apollo-server-express';
import { ObjectId } from 'mongodb';
import { eventRepository, programRepository, teamRepository, userRepository } from '../models';
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
  const events =
    (await eventRepository.findEventsManagedByUser(user.id, { _id: 1 }))?.map((e) => e._id) ?? [];
  const teams =
    (await teamRepository.findTeamsCoachedByUser(user.id, { _id: 1 }))?.map((t) => t._id) ?? [];
  const programs =
    (await programRepository.findProgramsManagedByUser(user.id, { _id: 1 }))?.map((p) => p._id) ??
    [];

  return {
    user: {
      ...user,
      isUser: (userId: ObjectId) => userId.equals(user.id),
      isProgramManagerOf: (programId: ObjectId) => !!programs.find((p) => programId.equals(p)),
      isEventManagerOf: (eventId: ObjectId) => !!events.find((e) => eventId.equals(e)),
      isCoachOf: (teamId: ObjectId) => !!teams.find((t) => teamId.equals(t)),
    },
    userTimeZone: 'Europe/Bratislava',
    authProfileData: profileData,
  };
}
