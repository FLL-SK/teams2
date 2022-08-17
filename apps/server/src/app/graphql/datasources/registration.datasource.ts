import { DataSourceConfig } from 'apollo-datasource';
import { ApolloContext } from '../apollo-context';
import { BaseDataSource } from './_base.datasource';
import {
  eventRepository,
  RegistrationData,
  registrationRepository,
  teamRepository,
} from '../../models';
import { Registration, RegistrationInput, TeamSizeInput } from '../../generated/graphql';
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
    const reg = this.loader.load(id.toString());
    return reg;
  }

  async createRegistration(eventId: ObjectId, teamId: ObjectId): Promise<Registration> {
    const event = await eventRepository.findById(eventId).exec();
    const team = await teamRepository.findById(teamId).exec();
    if (!team || !event) {
      throw new Error('Team or event not found');
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
    const registration = await registrationRepository
      .findByIdAndUpdate(id, input, { new: true })
      .exec();
    return RegistrationMapper.toRegistration(registration);
  }

  async cancelRegistration(id: ObjectId): Promise<Registration> {
    const registration = await registrationRepository.findById(id).exec();
    this.userGuard.isAdmin() ||
      this.userGuard.isCoach(registration.teamId) ||
      this.userGuard.notAuthorized();
    registration.canceledOn = new Date();
    registration.canceledBy = this.context.user._id;
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
    this.userGuard.isAdmin() || this.userGuard.notAuthorized();

    const registration = await registrationRepository
      .findByIdAndUpdate(id, { invoiceIssuedOn, invoiceRef }, { new: true })
      .exec();
    return RegistrationMapper.toRegistration(registration);
  }

  async clearInvoicedOn(id: ObjectId): Promise<Registration> {
    this.userGuard.isAdmin() || this.userGuard.notAuthorized();

    const registration = await registrationRepository
      .findByIdAndUpdate(id, { invoiceIssuedOn: null }, { new: true })
      .exec();
    return RegistrationMapper.toRegistration(registration);
  }

  async setPaidOn(id: ObjectId, paidOn: Date): Promise<Registration> {
    this.userGuard.isAdmin() || this.userGuard.notAuthorized();

    const registration = await registrationRepository
      .findByIdAndUpdate(id, { paidOn }, { new: true })
      .exec();
    return RegistrationMapper.toRegistration(registration);
  }

  async clearPaidOn(id: ObjectId): Promise<Registration> {
    this.userGuard.isAdmin() || this.userGuard.notAuthorized();

    const registration = await registrationRepository
      .findByIdAndUpdate(id, { paidOn: null }, { new: true })
      .exec();
    return RegistrationMapper.toRegistration(registration);
  }

  async setShippedOn(id: ObjectId, shippedOn: Date): Promise<Registration> {
    this.userGuard.isAdmin() || this.userGuard.notAuthorized();

    const registration = await registrationRepository
      .findByIdAndUpdate(id, { shippedOn }, { new: true })
      .exec();
    return RegistrationMapper.toRegistration(registration);
  }

  async clearShippedOn(id: ObjectId): Promise<Registration> {
    this.userGuard.isAdmin() || this.userGuard.notAuthorized();

    const registration = await registrationRepository
      .findByIdAndUpdate(id, { shippedOn: null }, { new: true })
      .exec();
    return RegistrationMapper.toRegistration(registration);
  }

  async setShipmentGroup(id: ObjectId, shipmentGroup: string): Promise<Registration> {
    this.userGuard.isAdmin() || this.userGuard.notAuthorized();

    const registration = await registrationRepository
      .findByIdAndUpdate(id, { shipmentGroup }, { new: true })
      .exec();
    return RegistrationMapper.toRegistration(registration);
  }

  async setTeamSize(id: ObjectId, input: TeamSizeInput): Promise<Registration> {
    const registration = await registrationRepository.findById(id).exec();
    this.userGuard.isAdmin() ||
      this.userGuard.isCoach(registration.teamId) ||
      this.userGuard.notAuthorized();
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
      this.userGuard.notAuthorized();
    registration.sizeConfirmedOn = date;
    await registration.save();
    emailTeamSizeConfirmed(registration.eventId, registration.teamId, this.context.user.username);
    return RegistrationMapper.toRegistration(registration);
  }

  async clearTeamSizeConfirmedOn(id: ObjectId): Promise<Registration> {
    const registration = await registrationRepository.findById(id).exec();
    this.userGuard.isAdmin() ||
      this.userGuard.isCoach(registration.teamId) ||
      this.userGuard.notAuthorized();
    registration.sizeConfirmedOn = null;
    await registration.save();
    return RegistrationMapper.toRegistration(registration);
  }

  async setConfirmedOn(id: ObjectId, confirmedOn: Date): Promise<Registration> {
    this.userGuard.isAdmin() || this.userGuard.notAuthorized();

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
    this.userGuard.isAdmin() || this.userGuard.notAuthorized();

    const registration = await registrationRepository
      .findByIdAndUpdate(id, { confirmedOn: null }, { new: true })
      .exec();
    return RegistrationMapper.toRegistration(registration);
  }
}
