import { ObjectId } from 'mongodb';
import { eventRepository, programRepository, teamRepository, UserDataNoPassword } from '../models';

export function guardLoggedIn(user: UserDataNoPassword): boolean {
  if (!user) {
    throw new Error('You need to be logged in.');
  } else {
    return true;
  }
}

export function guardSuperAdmin(user: UserDataNoPassword): boolean {
  if (!user.isSuperAdmin) {
    throw new Error('Requires superadmin permissions.');
  } else {
    return true;
  }
}

export function guardAdmin(user: UserDataNoPassword): boolean {
  if (!user.isAdmin) {
    throw new Error('Requires admin permissions.');
  } else {
    return true;
  }
}

export function guardSelf(user: UserDataNoPassword, userId: ObjectId): boolean {
  if (user._id.equals(userId)) {
    return true;
  } else {
    throw new Error('You are not authorized.');
  }
}

export async function guardCoach(user: UserDataNoPassword, teamId: ObjectId): Promise<boolean> {
  const teams = await teamRepository.findTeamsCoachedByUser(user._id, { _id: 1 });
  if (!teams.some((t) => t._id.equals(teamId))) {
    throw new Error('You are not a coach of this team');
  } else {
    return true;
  }
}

export async function guardEventManager(
  user: UserDataNoPassword,
  eventId: ObjectId
): Promise<boolean> {
  const event = await eventRepository.findById(eventId).exec();
  if (event.managersIds.findIndex((u) => u.equals(user._id)) === -1) {
    throw new Error('You are not a manager of this event');
  } else {
    return true;
  }
}

export async function guardProgramManager(
  user: UserDataNoPassword,
  programId: ObjectId
): Promise<boolean> {
  const program = await programRepository.findById(programId).exec();
  if (program.managersIds.findIndex((u) => u.equals(user._id)) === -1) {
    throw new Error('You are not a manager of this program');
  } else {
    return true;
  }
}
