import { ObjectId } from 'mongodb';
import {
  eventRepository,
  programRepository,
  registrationRepository,
  teamRepository,
  UserDataNoPassword,
} from '../models';

/** kontrola oprávnenia pre `UserGuard.require` – hodnota alebo (asynchrónna) funkcia */
export type GuardCheck = boolean | (() => boolean | Promise<boolean>);

export class UserGuard {
  protected user?: UserDataNoPassword;
  protected coachOfTeams?: string[];
  protected eventManagerOfEvents?: string[];
  protected programManagerOfPrograms?: string[];
  protected contactVisibleUserIds?: Promise<Set<string>>;
  protected managedTeamIds?: Promise<Set<string>>;
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
    // superadmin je vždy aj admin, aj keď má explicitne `isAdmin: false` (#280)
    return this.user ? !!(this.user.isAdmin || this.user.isSuperAdmin) : false;
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

  /** spravuje používateľ niektorý turnaj v programe? (napr. kvôli pozvánkam tímov programu) */
  async isEventManagerInProgram(programId: ObjectId) {
    if (!this.user || !programId) {
      return false;
    }
    if (this.isAdmin() || (await this.isProgramManager(programId))) {
      return true;
    }
    const events = await this.getManagedEvents();
    if (events.length === 0) {
      return false;
    }
    const e = await eventRepository.exists({
      _id: { $in: events.map((id) => new ObjectId(id)) },
      programId,
    });
    return !!e;
  }

  /** filter aktívnych registrácií na turnaje / do programov, ktoré používateľ spravuje (alebo null) */
  protected async managedRegistrationsFilter() {
    const [events, programs] = await Promise.all([
      this.getManagedEvents(),
      this.getManagedPrograms(),
    ]);
    // prázdny zoznam do filtra neposielať – `{ eventId: undefined }` by zodpovedalo každej registrácii do programu
    const or: Record<string, unknown>[] = [];
    if (events.length > 0) {
      or.push({ eventId: { $in: events.map((id) => new ObjectId(id)) } });
    }
    if (programs.length > 0) {
      or.push({ programId: { $in: programs.map((id) => new ObjectId(id)) } });
    }
    return or.length > 0 ? { canceledOn: null, $or: or } : null;
  }

  /**
   * ID tímov registrovaných (aktívne) na turnaj alebo do programu, ktorý používateľ spravuje.
   * Načíta sa raz pre požiadavku.
   */
  async getManagedTeams(): Promise<Set<string>> {
    if (this.managedTeamIds === undefined) {
      this.managedTeamIds = (async () => {
        const q = this.user ? await this.managedRegistrationsFilter() : null;
        if (!q) {
          return new Set<string>();
        }
        const teamIds: ObjectId[] = await registrationRepository.distinct('teamId', q).exec();
        return new Set(teamIds.map((id) => id.toString()));
      })();
    }
    return this.managedTeamIds;
  }

  /** tím je registrovaný na turnaj / do programu, ktorý používateľ spravuje */
  async isManagerOfTeam(teamId: ObjectId) {
    if (!teamId) {
      return false;
    }
    return (await this.getManagedTeams()).has(teamId.toString());
  }

  /**
   * Smie používateľ čítať adresy a kontakty tímu? Admin, tréner tímu a správca turnaja/programu,
   * na ktorom je tím registrovaný. #289
   */
  async canReadTeamDetails(teamId: ObjectId) {
    return this.isAdmin() || (await this.isCoach(teamId)) || (await this.isManagerOfTeam(teamId));
  }

  /**
   * Smie používateľ čítať registráciu? Admin, tréner tímu, správca programu a pri registrácii
   * na turnaj aj správca turnaja. #289
   */
  async canReadRegistration(reg: {
    teamId?: ObjectId | null;
    programId?: ObjectId | null;
    eventId?: ObjectId | null;
  }) {
    if (!this.user) {
      return false;
    }
    return (
      this.isAdmin() ||
      (await this.isCoach(reg.teamId)) ||
      (await this.isProgramManager(reg.programId)) ||
      (await this.isEventManager(reg.eventId))
    );
  }

  /**
   * ID používateľov, ktorých kontakt (e-mail, telefón) smie používateľ vidieť: spolutréneri
   * jeho tímov a tréneri tímov registrovaných na turnaj / do programu, ktorý spravuje. #289
   */
  protected async getContactVisibleUserIds(): Promise<Set<string>> {
    if (this.contactVisibleUserIds === undefined) {
      this.contactVisibleUserIds = (async () => {
        const teamIds = new Set([
          ...(await this.getCoachedTeams()),
          ...(await this.getManagedTeams()),
        ]);
        if (teamIds.size === 0) {
          return new Set<string>();
        }
        const coachIds: ObjectId[] = await teamRepository
          .distinct('coachesIds', { _id: { $in: [...teamIds].map((id) => new ObjectId(id)) } })
          .exec();
        return new Set(coachIds.map((id) => id.toString()));
      })();
    }
    return this.contactVisibleUserIds;
  }

  /** smie používateľ čítať kontakt (e-mail, telefón) iného používateľa? #289 */
  async canReadUserContact(userId: ObjectId) {
    if (!this.user || !userId) {
      return false;
    }
    if (this.isAdmin() || this.isSelf(userId)) {
      return true;
    }
    return (await this.getContactVisibleUserIds()).has(userId.toString());
  }

  /**
   * Overí, že aspoň jedna z kontrol prejde, inak vyhodí `notAuthorized(action)`.
   *
   * Kontroly sa vyhodnocujú postupne a lenivo – ďalšia sa spustí, iba ak predchádzajúca neprešla.
   * Asynchrónnu kontrolu treba odovzdať ako funkciu:
   *
   * ```ts
   * await this.userGuard.require('Update event',
   *   this.userGuard.isAdmin(),
   *   () => this.userGuard.isEventManager(eventId));
   * ```
   *
   * Priamy `Promise` sa zámerne nepovoľuje – bez `await` by bol vždy pravdivý (#279, #297).
   */
  async require(action: string, ...checks: GuardCheck[]): Promise<void> {
    for (const check of checks) {
      if (typeof check === 'function' ? await check() : check) {
        return;
      }
    }
    this.notAuthorized(action);
  }

  notAuthorized(context?: string): never {
    throw new Error(
      `(${this.user ? this.user.username : 'not-logged-in'}) ${this.message}${
        context ? `: ${context}` : ''
      }`,
    );
  }
}
