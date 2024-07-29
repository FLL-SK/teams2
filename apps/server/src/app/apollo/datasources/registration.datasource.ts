import { BaseDataSource } from './_base.datasource';
import {
  eventRepository,
  RegistrationData,
  RegistrationGroup,
  registrationRepository,
  teamRepository,
  userRepository,
} from '../../models';
import {
  RegisteredTeamPayload,
  Registration,
  RegistrationFilter,
  RegistrationInput,
  TeamSizeInput,
} from '../../_generated/graphql';
import { RegistrationMapper } from '../mappers';
import { ObjectId } from 'mongodb';
import { logger } from '@teams2/logger';
import Dataloader from 'dataloader';
import { emailTeamSizeConfirmed, emailRegistrationConfirmed } from '../../utils/emails';
import { FilterQuery, UpdateQuery } from 'mongoose';

const logBase = logger('DS:Registration');

export class RegistrationDataSource extends BaseDataSource {
  private loader: Dataloader<string, Registration, string>;

  protected override _initialize() {
    this.loader = new Dataloader(this.loaderFn.bind(this));
  }

  private async loaderFn(ids: string[]): Promise<Registration[]> {
    const oids = ids.map((id) => new ObjectId(id));
    const rec = await registrationRepository.find({ _id: { $in: ids } }).exec();
    const data = oids.map((id) => rec.find((e) => e._id.equals(id)) ?? null);
    return data.map(RegistrationMapper.toRegistration.bind(this));
  }

  async getRegistration(id: ObjectId): Promise<Registration> {
    if (!id) return null;
    const reg = this.loader.load(id.toString());
    return reg;
  }

  async getRegistrations(filter: RegistrationFilter): Promise<Registration[]> {
    const q: FilterQuery<RegistrationData> = {};
    if (filter.active) {
      q.canceledOn = null;
    }
    if (filter.programId) {
      q.programId = filter.programId;
    }
    if (filter.eventId) {
      q.eventId = filter.eventId;
    }
    if (filter.teamId) {
      q.teamId = filter.teamId;
    }
    const regs = await registrationRepository.find(q).exec();
    return regs.map(RegistrationMapper.toRegistration);
  }

  async getRegistrationGroups(filter: RegistrationFilter): Promise<RegistrationGroup[]> {
    // TODO: candidate for dataloader
    const regsCount = await registrationRepository.groupRegistrations(filter);
    return regsCount;
  }

  async createRegistration(
    eventId: ObjectId,
    teamId: ObjectId,
    input: RegistrationInput,
  ): Promise<Registration> {
    const log = logBase.extend('createRegistration');
    this.userGuard.isAdmin() ||
      this.userGuard.isCoach(teamId) ||
      this.userGuard.notAuthorized('Create registration');

    // check if team is not already registered
    const r = await registrationRepository.groupRegistrations({ eventId, teamId, active: true });
    log.debug('Registrations count teamId=%s count=%d', teamId.toHexString(), r);
    if (r.length > 0) {
      throw { name: 'team_already_registered' };
    }

    const event = await eventRepository.findById(eventId).exec();
    if (!event) {
      log.warn('Event not found teamId=%s eventId=%s', teamId.toHexString(), eventId.toHexString());
      throw { name: 'event_not_found' };
    }

    if (
      event.maxTeams &&
      (await registrationRepository.groupRegistrations({ eventId, active: true })).length >=
        event.maxTeams
    ) {
      throw { name: 'event_full' };
    }

    const team = await teamRepository.findById(teamId).exec();
    if (!team) {
      throw { name: 'team_not_found' };
    }

    const newReg: RegistrationData = {
      programId: event.programId,
      eventId,
      teamId,
      createdOn: new Date(),
      createdBy: this.context.user._id,
      shipTo: team.shipTo,
      billTo: team.billTo,
      type: input.type,
      teamsImpacted: 1,
      setCount: 1,
    };

    if (input.type === 'CLASS_PACK') {
      newReg.setCount = input.setCount;
      newReg.childrenImpacted = input.impactedChildrenCount;
      newReg.teamsImpacted = input.impactedTeamCount;
    }

    const registration = new registrationRepository(newReg);
    await registration.save();
    return RegistrationMapper.toRegistration(registration);
  }

  async updateRegistration(id: ObjectId, input: RegistrationInput): Promise<Registration> {
    this.userGuard.isAdmin() || this.userGuard.notAuthorized('Update registration');
    const u: UpdateQuery<RegistrationData> = {
      type: input.type,
      childrenImpacted: input.impactedChildrenCount,
      teamsImpacted: input.impactedTeamCount,
    };
    const registration = await registrationRepository
      .findByIdAndUpdate(id, u, { new: true })
      .exec();
    return RegistrationMapper.toRegistration(registration);
  }

  async cancelRegistration(id: ObjectId): Promise<Registration> {
    const registration = await registrationRepository.findById(id).exec();
    this.userGuard.isAdmin() ||
      this.userGuard.isCoach(registration.teamId) ||
      this.userGuard.notAuthorized('Cancel registration');
    registration.canceledOn = new Date();
    registration.canceledBy = this.context.user._id;
    await registration.save();
    return RegistrationMapper.toRegistration(registration);
  }

  async changeRegisteredEvent(regId: ObjectId, newEventId: ObjectId): Promise<Registration> {
    this.userGuard.isAdmin() || this.userGuard.notAuthorized('Change registered event');
    const registration = await registrationRepository.findById(regId).exec();
    const newEvent = await eventRepository.findById(newEventId).exec();
    if (!newEvent) {
      throw new Error('Turnaj nebol nájdený');
    }
    registration.eventId = newEventId;
    registration.programId = newEvent.programId;
    await registration.save();

    return RegistrationMapper.toRegistration(registration);
  }

  async getEventRegistrations(eventId: ObjectId): Promise<Registration[]> {
    const regs = await registrationRepository
      .find({ eventId, canceledOn: null })
      .sort({ createdOn: 1 })
      .exec();
    return regs.map(RegistrationMapper.toRegistration);
  }

  async getEventRegistrationsCount(eventId: ObjectId): Promise<number> {
    const count = await registrationRepository.countDocuments({ eventId, canceledOn: null }).exec();
    return count;
  }

  async getProgramRegistrations(programId: ObjectId): Promise<Registration[]> {
    const regs = await registrationRepository
      .find({ programId, canceledOn: null })
      .sort({ createdOn: 1 })
      .exec();
    return regs.map(RegistrationMapper.toRegistration);
  }

  async getProgramRegistrationsCount(programId: ObjectId): Promise<number> {
    const count = await registrationRepository
      .countDocuments({ programId, canceledOn: null })
      .exec();
    return count;
  }

  async setInvoicedOn(
    id: ObjectId,
    invoiceIssuedOn?: Date,
    invoiceRef?: string,
  ): Promise<Registration> {
    this.userGuard.isAdmin() || this.userGuard.notAuthorized('Set invoiced on');

    const registration = await registrationRepository
      .findByIdAndUpdate(id, { invoiceIssuedOn, invoiceRef }, { new: true })
      .exec();
    return RegistrationMapper.toRegistration(registration);
  }

  async clearInvoicedOn(id: ObjectId): Promise<Registration> {
    this.userGuard.isAdmin() || this.userGuard.notAuthorized('Clear invoiced on');

    const registration = await registrationRepository
      .findByIdAndUpdate(id, { invoiceIssuedOn: null }, { new: true })
      .exec();
    return RegistrationMapper.toRegistration(registration);
  }

  async setPaidOn(id: ObjectId, paidOn: Date): Promise<Registration> {
    this.userGuard.isAdmin() || this.userGuard.notAuthorized('Set paid on');

    const registration = await registrationRepository
      .findByIdAndUpdate(id, { paidOn }, { new: true })
      .exec();
    return RegistrationMapper.toRegistration(registration);
  }

  async clearPaidOn(id: ObjectId): Promise<Registration> {
    this.userGuard.isAdmin() || this.userGuard.notAuthorized('Clear paid on');

    const registration = await registrationRepository
      .findByIdAndUpdate(id, { paidOn: null }, { new: true })
      .exec();
    return RegistrationMapper.toRegistration(registration);
  }

  async setShippedOn(id: ObjectId, shippedOn: Date): Promise<Registration> {
    this.userGuard.isAdmin() || this.userGuard.notAuthorized('Set shipped on');

    const registration = await registrationRepository
      .findByIdAndUpdate(id, { shippedOn }, { new: true })
      .exec();
    return RegistrationMapper.toRegistration(registration);
  }

  async clearShippedOn(id: ObjectId): Promise<Registration> {
    this.userGuard.isAdmin() || this.userGuard.notAuthorized('Clear shipped on');

    const registration = await registrationRepository
      .findByIdAndUpdate(id, { shippedOn: null }, { new: true })
      .exec();
    return RegistrationMapper.toRegistration(registration);
  }

  async setShipmentGroup(id: ObjectId, shipmentGroup: string): Promise<Registration> {
    this.userGuard.isAdmin() || this.userGuard.notAuthorized('Set shipment group');

    const registration = await registrationRepository
      .findByIdAndUpdate(id, { shipmentGroup }, { new: true })
      .exec();
    return RegistrationMapper.toRegistration(registration);
  }

  async setTeamSize(id: ObjectId, input: TeamSizeInput): Promise<Registration> {
    const r = await registrationRepository.findById(id).exec();

    this.userGuard.isAdmin() ||
      this.userGuard.isCoach(r.teamId) ||
      this.userGuard.notAuthorized('Set team size');

    r.girlCount = input.girlCount;
    r.boyCount = input.boyCount;
    r.coachCount = input.coachCount;

    const c = r.girlCount + r.boyCount;
    if (!r.childrenImpacted || r.childrenImpacted < c) {
      r.childrenImpacted = c;
    }
    await r.save();
    return RegistrationMapper.toRegistration(r);
  }

  async setTeamSizeConfirmedOn(id: ObjectId, date: Date): Promise<Registration> {
    const r = await registrationRepository.findById(id).exec();
    this.userGuard.isAdmin() ||
      this.userGuard.isCoach(r.teamId) ||
      this.userGuard.notAuthorized('Set team size confirmed on');
    r.sizeConfirmedOn = date;
    await r.save();

    emailTeamSizeConfirmed(r.eventId, r.teamId, this.context.user.username);

    return RegistrationMapper.toRegistration(r);
  }

  async clearTeamSizeConfirmedOn(id: ObjectId): Promise<Registration> {
    const r = await registrationRepository.findById(id).exec();
    this.userGuard.isAdmin() ||
      this.userGuard.isCoach(r.teamId) ||
      this.userGuard.notAuthorized('Clear team size confirmed on');
    r.sizeConfirmedOn = null;
    await r.save();
    return RegistrationMapper.toRegistration(r);
  }

  async setConfirmedOn(id: ObjectId, confirmedOn: Date): Promise<Registration> {
    this.userGuard.isAdmin() || this.userGuard.notAuthorized('Set confirmed on');

    const r = await registrationRepository
      .findByIdAndUpdate(id, { confirmedOn }, { new: true })
      .exec();

    emailRegistrationConfirmed(r.eventId, r.teamId, this.context.user.username);
    return RegistrationMapper.toRegistration(r);
  }

  async clearConfirmedOn(id: ObjectId): Promise<Registration> {
    this.userGuard.isAdmin() || this.userGuard.notAuthorized('Clear confirmed on');

    const registration = await registrationRepository
      .findByIdAndUpdate(id, { confirmedOn: null }, { new: true })
      .exec();
    return RegistrationMapper.toRegistration(registration);
  }

  async getRegisteredTeams(
    eventId: ObjectId,
    includeCoaches?: boolean,
  ): Promise<RegisteredTeamPayload[]> {
    const regs = await registrationRepository.find({ eventId, canceledOn: null }).exec();
    const teams: RegisteredTeamPayload[] = [];
    for (const reg of regs) {
      const team = await teamRepository.findById(reg.teamId).exec();
      if (!team) {
        continue;
      }
      const t: RegisteredTeamPayload = {
        id: reg._id,
        teamId: team._id,
        registeredOn: reg.createdOn,
        confirmedOn: reg.confirmedOn,
        paidOn: reg.paidOn,
        name: team.name,
        coachCount: reg.coachCount ?? 0,
        boyCount: reg.boyCount ?? 0,
        girlCount: reg.girlCount ?? 0,
        sizeConfirmedOn: reg.sizeConfirmedOn,
        type: reg.type,
        impactedChildrenCount: reg.childrenImpacted ?? 0,
        impactedTeamCount: reg.teamsImpacted ?? 1,
        setCount: reg.setCount ?? 1,
        address: {
          id: team.address._id,
          name: team.address.name,
          street: team.address.street,
          city: team.address.city,
          zip: team.address.zip,
          companyNumber: team.address.companyNumber,
          vatNumber: team.address.vatNumber,
          taxNumber: team.address.taxNumber,
        },
        coaches: [],
      };

      if (
        includeCoaches &&
        (this.context.userGuard.isAdmin() || this.context.userGuard.isEventManager(eventId))
      ) {
        const c = await userRepository
          .find({ _id: { $in: team.coachesIds }, deletedOn: null }, { _id: 1 })
          .sort({ username: 1 })
          .exec();
        const cp = c.map((u) => this.context.dataSources.user.getUser(u._id));
        t.coaches = await Promise.all(cp);
      }
      teams.push(t);
    }
    teams.sort((a, b) => a.name.localeCompare(b.name, 'sk', { sensitivity: 'base' }));
    return teams;
  }
}
