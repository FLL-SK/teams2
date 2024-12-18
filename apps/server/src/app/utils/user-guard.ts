import { ObjectId } from 'mongodb';
import {
  eventRepository,
  programRepository,
  registrationRepository,
  teamRepository,
  UserDataNoPassword,
} from '../models';

export class UserGuard {
  protected user?: UserDataNoPassword;
  protected coachOfTeams?: string[];
  protected eventManagerOfEvents?: string[];
  protected programManagerOfPrograms?: string[];
  protected message: string;

  constructor(user: UserDataNoPassword, message?: string) {
    this.user = user;
    this.message = message || 'Not authorized';
  }

  get userName() {
    return this.user ? this.user.username : 'not-logged-in';
  }

  getManagedEvents() {
    return this.eventManagerOfEvents;
  }

  isSuperAdmin() {
    return this.user ? !!this.user.isSuperAdmin : false;
  }

  isAdmin() {
    return this.user ? (this.user.isAdmin ?? this.user.isSuperAdmin ?? false) : false;
  }

  isLoggedIn() {
    return !!this.user;
  }

  isSelf(userId: ObjectId) {
    return this.user ? this.user._id.equals(userId) : false;
  }

  async isCoach(teamId: ObjectId) {
    if (!this.user) {
      return false;
    }
    if (!this.coachOfTeams) {
      this.coachOfTeams =
        (await teamRepository.findTeamsCoachedByUser(this.user._id, { _id: 1 }))?.map((t) =>
          t._id.toString(),
        ) ?? [];
    }
    return this.coachOfTeams.includes(teamId.toString());
  }

  async isCoachOfRegisteredTeamForEvent(eventId: ObjectId) {
    if (!this.user) {
      return false;
    }
    if (!this.coachOfTeams) {
      this.coachOfTeams =
        (await teamRepository.findTeamsCoachedByUser(this.user._id, { _id: 1 }))?.map((t) =>
          t._id.toString(),
        ) ?? [];
    }
    const teams = await registrationRepository.find({
      eventId: eventId,
      teamId: { $in: this.coachOfTeams },
    });
    return teams.some((t) => this.coachOfTeams.includes(t._id.toString()));
  }

  async isCoachOfRegisteredTeamForProgram(programId: ObjectId) {
    if (!this.user) {
      return false;
    }
    if (!this.coachOfTeams) {
      this.coachOfTeams =
        (await teamRepository.findTeamsCoachedByUser(this.user._id, { _id: 1 }))?.map((t) =>
          t._id.toString(),
        ) ?? [];
    }
    const teams = await registrationRepository.find({
      programId: programId,
      teamId: { $in: this.coachOfTeams.map((t) => new ObjectId(t)) },
      confirmedOn: { $ne: null },
    });
    return teams.some((t) => this.coachOfTeams.includes(t._id.toString()));
  }

  async isEventManager(eventId: ObjectId) {
    if (!this.user) {
      return false;
    }
    if (!this.eventManagerOfEvents) {
      this.eventManagerOfEvents =
        (await eventRepository.findEventsManagedByUser(this.user._id, { _id: 1 }))?.map((e) =>
          e._id.toString(),
        ) ?? [];
    }
    return this.eventManagerOfEvents.includes(eventId.toString());
  }

  async isProgramManager(programId: ObjectId) {
    if (!this.user) {
      return false;
    }
    if (!this.programManagerOfPrograms) {
      this.programManagerOfPrograms =
        (await programRepository.findProgramsManagedByUser(this.user._id, { _id: 1 }))?.map((p) =>
          p._id.toString(),
        ) ?? [];
    }
    return this.programManagerOfPrograms.includes(programId.toString());
  }

  notAuthorized(context?: string) {
    throw new Error(
      `(${this.user ? this.user.username : 'not-logged-in'}) ${this.message}${
        context ? `: ${context}` : ''
      }`,
    );
  }
}
