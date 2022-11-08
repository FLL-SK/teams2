import { DataSourceConfig } from 'apollo-datasource';
import { ApolloContext } from '../apollo-context';
import { BaseDataSource } from './_base.datasource';
import {
  eventRepository,
  RegistrationData,
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
} from '../../generated/graphql';
import { RegistrationMapper } from '../mappers';
import { ObjectId } from 'mongodb';
import { logger } from '@teams2/logger';
import * as Dataloader from 'dataloader';
import { emailTeamSizeConfirmed, emailRegistrationConfirmed } from '../../utils/emails';

export class RegistrationDataSource extends BaseDataSource {
  private loader: Dataloader<string, Registration, string>;

  constructor() {
    super();
  }

  initialize(config: DataSourceConfig<ApolloContext>) {
    super.initialize(config);
    this.loader = new Dataloader(this.loaderFn.bind(this));
    this.logBase = logger('DS:Registration');
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

  async getRegistrationsCount(filter: RegistrationFilter): Promise<number> {
    // TODO: candidate for dataloader
    const regsCount = await registrationRepository.countRegistrations(filter);
    return regsCount;
  }

  async createRegistration(eventId: ObjectId, teamId: ObjectId): Promise<Registration> {
    const log = this.logBase.extend('createRegistration');
    this.userGuard.isAdmin() ||
      this.userGuard.isCoach(teamId) ||
      this.userGuard.notAuthorized('Create registration');

    // check if team is not already registered
    const r = await registrationRepository.countRegistrations({ eventId, teamId, active: true });
    log.debug('Registrations count teamId=%s count=%d', teamId.toHexString(), r);
    if (r > 0) {
      throw { name: 'team_already_registered' };
    }

    const event = await eventRepository.findById(eventId).exec();
    if (!event) {
      log.warn('Event not found teamId=%s eventId=%s', teamId.toHexString(), eventId.toHexString());
      throw { name: 'event_not_found' };
    }

    if (
      event.maxTeams &&
      (await registrationRepository.countRegistrations({ eventId, active: true })) >= event.maxTeams
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
    };

    const registration = new registrationRepository(newReg);
    await registration.save();
    return RegistrationMapper.toRegistration(registration);
  }

  async updateRegistration(id: ObjectId, input: RegistrationInput): Promise<Registration> {
    this.userGuard.isAdmin() || this.userGuard.notAuthorized('Update registration');
    const registration = await registrationRepository
      .findByIdAndUpdate(id, input, { new: true })
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
    const count = await registrationRepository.count({ eventId, canceledOn: null }).exec();
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
    const count = await registrationRepository.count({ programId, canceledOn: null }).exec();
    return count;
  }

  async setInvoicedOn(
    id: ObjectId,
    invoiceIssuedOn?: Date,
    invoiceRef?: string
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
    const registration = await registrationRepository.findById(id).exec();
    this.userGuard.isAdmin() ||
      this.userGuard.isCoach(registration.teamId) ||
      this.userGuard.notAuthorized('Set team size');
    registration.girlCount = input.girlCount;
    registration.boyCount = input.boyCount;
    registration.coachCount = input.coachCount;
    await registration.save();
    return RegistrationMapper.toRegistration(registration);
  }

  async setTeamSizeConfirmedOn(id: ObjectId, date: Date): Promise<Registration> {
    const registration = await registrationRepository.findById(id).exec();
    this.userGuard.isAdmin() ||
      this.userGuard.isCoach(registration.teamId) ||
      this.userGuard.notAuthorized('Set team size confirmed on');
    registration.sizeConfirmedOn = date;
    await registration.save();

    emailTeamSizeConfirmed(registration.eventId, registration.teamId, this.context.user.username);

    return RegistrationMapper.toRegistration(registration);
  }

  async clearTeamSizeConfirmedOn(id: ObjectId): Promise<Registration> {
    const registration = await registrationRepository.findById(id).exec();
    this.userGuard.isAdmin() ||
      this.userGuard.isCoach(registration.teamId) ||
      this.userGuard.notAuthorized('Clear team size confirmed on');
    registration.sizeConfirmedOn = null;
    await registration.save();
    return RegistrationMapper.toRegistration(registration);
  }

  async setConfirmedOn(id: ObjectId, confirmedOn: Date): Promise<Registration> {
    this.userGuard.isAdmin() || this.userGuard.notAuthorized('Set confirmed on');

    const registration = await registrationRepository
      .findByIdAndUpdate(id, { confirmedOn }, { new: true })
      .exec();

    emailRegistrationConfirmed(
      registration.eventId,
      registration.teamId,
      this.context.user.username
    );
    return RegistrationMapper.toRegistration(registration);
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
    includeCoaches?: boolean
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
