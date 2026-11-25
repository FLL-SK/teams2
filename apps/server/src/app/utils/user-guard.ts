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

  get userId() {
    return this.user ? this.user._id : null;
  }

  /** ID tímov, ktoré používateľ trénuje (načíta sa raz pre požiadavku) */
  async getCoachedTeams(): Promise<string[]> {
    if (!this.user) {
      return [];
    }
    if (!this.coachOfTeams) {
      this.coachOfTeams =
        (await teamRepository.findTeamsCoachedByUser(this.user._id, { _id: 1 }))?.map((t) =>
          t._id.toString(),
        ) ?? [];
    }
    return this.coachOfTeams;
  }

  /** ID turnajov, ktoré používateľ spravuje (načíta sa raz pre požiadavku) */
  async getManagedEvents(): Promise<string[]> {
    if (!this.user) {
      return [];
    }
    if (!this.eventManagerOfEvents) {
      this.eventManagerOfEvents =
        (await eventRepository.findEventsManagedByUser(this.user._id, { _id: 1 }))?.map((e) =>
          e._id.toString(),
        ) ?? [];
    }
    return this.eventManagerOfEvents;
  }

  /** ID programov, ktoré používateľ spravuje (načíta sa raz pre požiadavku) */
  async getManagedPrograms(): Promise<string[]> {
    if (!this.user) {
      return [];
    }
    if (!this.programManagerOfPrograms) {
      this.programManagerOfPrograms =
        (await programRepository.findProgramsManagedByUser(this.user._id, { _id: 1 }))?.map((p) =>
          p._id.toString(),
        ) ?? [];
    }
    return this.programManagerOfPrograms;
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
    if (!teamId) {
      return false;
    }
    return (await this.getCoachedTeams()).includes(teamId.toString());
  }

  async isCoachOfRegisteredTeamForEvent(eventId: ObjectId) {
    const coachOfTeams = await this.getCoachedTeams();
    if (coachOfTeams.length === 0) {
      return false;
    }
    // aktívna registrácia na turnaj niektorého z trénovaných tímov
    const count = await registrationRepository.countDocuments({
      eventId: eventId,
      teamId: { $in: coachOfTeams.map((t) => new ObjectId(t)) },
      canceledOn: null,
    });
    return count > 0;
  }

  async isCoachOfRegisteredTeamForProgram(programId: ObjectId) {
    const coachOfTeams = await this.getCoachedTeams();
    if (coachOfTeams.length === 0) {
      return false;
    }
    // potvrdená (a nezrušená) registrácia niektorého z trénovaných tímov do programu
    const count = await registrationRepository.countDocuments({
      programId: programId,
      teamId: { $in: coachOfTeams.map((t) => new ObjectId(t)) },
      confirmedOn: { $ne: null },
      canceledOn: null,
    });
    return count > 0;
  }

  async isEventManager(eventId: ObjectId) {
    if (!eventId) {
      return false;
    }
    return (await this.getManagedEvents()).includes(eventId.toString());
  }

  async isProgramManager(programId: ObjectId) {
    if (!programId) {
      return false;
    }
    return (await this.getManagedPrograms()).includes(programId.toString());
  }

  async isProgramManagerForEvent(eventId: ObjectId) {
    if (!this.user || !eventId) {
      return false;
    }

    const event = await eventRepository.findById(eventId).lean().exec();

    if (!event) {
      return false;
    }
    return this.isProgramManager(event.programId);
  }

  notAuthorized(context?: string) {
    throw new Error(
      `(${this.user ? this.user.username : 'not-logged-in'}) ${this.message}${
        context ? `: ${context}` : ''
      }`,
    );
  }
}
