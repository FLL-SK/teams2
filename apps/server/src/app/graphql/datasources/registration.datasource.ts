import { DataSourceConfig } from 'apollo-datasource';
import { ApolloContext } from '../apollo-context';
import { BaseDataSource } from './_base.datasource';
import {
  eventRepository,
  RegistrationData,
  registrationRepository,
  teamRepository,
} from '../../models';
import { Registration, RegistrationInput } from '../../generated/graphql';
import { RegistrationMapper } from '../mappers';
import { ObjectId } from 'mongodb';
import { logger } from '@teams2/logger';
import * as Dataloader from 'dataloader';

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
    const data = await registrationRepository.find({ _id: { $in: ids } }).exec();
    return data.map(RegistrationMapper.toRegistration.bind(this));
  }

  async getRegistration(id: ObjectId): Promise<Registration> {
    this.userGuard.isAdmin() || this.userGuard.failed();
    const reg = this.loader.load(id.toString());
    return reg;
  }

  async createRegistration(eventId: ObjectId, teamId: ObjectId): Promise<Registration> {
    this.userGuard.isAdmin() || this.userGuard.isCoach(teamId) || this.userGuard.failed();
    const event = await eventRepository.findById(eventId).exec();
    const team = await teamRepository.findById(teamId).exec();
    if (!team || !event) {
      throw new Error('Team or event not found');
    }
    const newReg: RegistrationData = {
      programId: event.programId,
      eventId,
      teamId,
      registeredOn: new Date(),
      registeredBy: this.context.user._id,
      shipTo: team.shipTo,
      billTo: team.billTo,
    };

    const registration = new registrationRepository(newReg);
    await registration.save();
    return RegistrationMapper.toRegistration(registration);
  }

  async updateRegistration(id: ObjectId, input: RegistrationInput): Promise<Registration> {
    this.userGuard.isAdmin() || this.userGuard.failed();
    const registration = await registrationRepository
      .findByIdAndUpdate(id, input, { new: true })
      .exec();
    return RegistrationMapper.toRegistration(registration);
  }

  async deleteRegistration(id: ObjectId): Promise<Registration> {
    this.userGuard.isAdmin() || this.userGuard.failed();
    const registration = await registrationRepository.findByIdAndDelete({ _id: id }).exec();
    return RegistrationMapper.toRegistration(registration);
  }

  async deleteRegistrationET(eventId: ObjectId, teamId: ObjectId): Promise<Registration> {
    this.userGuard.isAdmin() || this.userGuard.failed();
    const registration = await registrationRepository.findOneAndDelete({ eventId, teamId }).exec();
    return RegistrationMapper.toRegistration(registration);
  }

  async getEventRegistrations(eventId: ObjectId): Promise<Registration[]> {
    this.userGuard.isAdmin() || this.userGuard.failed();
    const regs = await registrationRepository.find({ eventId }).sort({ registeredOn: 1 }).exec();
    return regs.map(RegistrationMapper.toRegistration);
  }

  async getProgramRegistrations(programId: ObjectId): Promise<Registration[]> {
    this.userGuard.isAdmin() || this.userGuard.failed();
    const regs = await registrationRepository.find({ programId }).sort({ registeredOn: 1 }).exec();
    return regs.map(RegistrationMapper.toRegistration);
  }

  async setInvoicedOn(id: ObjectId, invoiceIssuedOn: Date): Promise<Registration> {
    this.userGuard.isAdmin() || this.userGuard.failed();
    const registration = await registrationRepository
      .findByIdAndUpdate(id, { invoiceIssuedOn }, { new: true })
      .exec();
    return RegistrationMapper.toRegistration(registration);
  }

  async clearInvoicedOn(id: ObjectId): Promise<Registration> {
    this.userGuard.isAdmin() || this.userGuard.failed();
    const registration = await registrationRepository
      .findByIdAndUpdate(id, { invoiceIssuedOn: null }, { new: true })
      .exec();
    return RegistrationMapper.toRegistration(registration);
  }

  async setPaidOn(id: ObjectId, paidOn: Date): Promise<Registration> {
    this.userGuard.isAdmin() || this.userGuard.failed();
    const registration = await registrationRepository
      .findByIdAndUpdate(id, { paidOn }, { new: true })
      .exec();
    return RegistrationMapper.toRegistration(registration);
  }

  async clearPaidOn(id: ObjectId): Promise<Registration> {
    this.userGuard.isAdmin() || this.userGuard.failed();
    const registration = await registrationRepository
      .findByIdAndUpdate(id, { paidOn: null }, { new: true })
      .exec();
    return RegistrationMapper.toRegistration(registration);
  }

  async setShippedOn(id: ObjectId, shippedOn: Date): Promise<Registration> {
    this.userGuard.isAdmin() || this.userGuard.failed();
    const registration = await registrationRepository
      .findByIdAndUpdate(id, { shippedOn }, { new: true })
      .exec();
    return RegistrationMapper.toRegistration(registration);
  }

  async clearShippedOn(id: ObjectId): Promise<Registration> {
    this.userGuard.isAdmin() || this.userGuard.failed();
    const registration = await registrationRepository
      .findByIdAndUpdate(id, { shippedOn: null }, { new: true })
      .exec();
    return RegistrationMapper.toRegistration(registration);
  }

  async setShipmentGroup(id: ObjectId, shipmentGroup: string): Promise<Registration> {
    this.userGuard.isAdmin() || this.userGuard.failed();
    const registration = await registrationRepository
      .findByIdAndUpdate(id, { shipmentGroup }, { new: true })
      .exec();
    return RegistrationMapper.toRegistration(registration);
  }

  async setTeamSize(id: ObjectId, teamSize: number): Promise<Registration> {
    this.userGuard.isAdmin() || this.userGuard.failed();
    const registration = await registrationRepository
      .findByIdAndUpdate(id, { teamSize }, { new: true })
      .exec();
    return RegistrationMapper.toRegistration(registration);
  }

  async setTeamSizeConfirmedOn(id: ObjectId, date: Date): Promise<Registration> {
    this.userGuard.isAdmin() || this.userGuard.failed();
    const registration = await registrationRepository
      .findByIdAndUpdate(id, { sizeConfirmedOn: date }, { new: true })
      .exec();
    return RegistrationMapper.toRegistration(registration);
  }

  async clearTeamSizeConfirmedOn(id: ObjectId): Promise<Registration> {
    this.userGuard.isAdmin() || this.userGuard.failed();
    const registration = await registrationRepository
      .findByIdAndUpdate(id, { sizeConfirmedOn: null }, { new: true })
      .exec();
    return RegistrationMapper.toRegistration(registration);
  }
}
