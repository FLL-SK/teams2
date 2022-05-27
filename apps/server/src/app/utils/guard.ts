import { ObjectId } from 'mongodb';
import { eventRepository, teamRepository, UserData } from '../models';

export function guardAdmin(user: UserData): boolean {
  if (!user.isAdmin) {
    throw new Error('You are not an admin');
  } else {
    return true;
  }
}

export function guardSelf(user: UserData, userId: ObjectId): boolean {
  if (user._id.equals(userId)) {
    return true;
  } else {
    throw new Error('You are not allowed to do this');
  }
}

export async function guardCoach(user: UserData, teamId: ObjectId): Promise<boolean> {
  const teams = await teamRepository.findTeamsCoachedByUser(user._id, { _id: 1 });
  if (!teams.some((t) => t._id.equals(teamId))) {
    throw new Error('You are not a coach of this team');
  } else {
    return true;
  }
}

export async function guardEventManager(user: UserData, eventId: ObjectId): Promise<boolean> {
  const events = await eventRepository.findEventsManagedByUser(user._id, { _id: 1 });
  if (!events.some((t) => t._id.equals(eventId))) {
    throw new Error('You are not a manager of this event');
  } else {
    return true;
  }
}
