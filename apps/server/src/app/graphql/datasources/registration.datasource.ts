import { DataSourceConfig } from 'apollo-datasource';
import { ApolloContext } from '../apollo-context';
import { BaseDataSource } from './_base.datasource';
import { registrationRepository } from '../../models';
import { Registration } from '../../generated/graphql';
import { RegistrationMapper } from '../mappers';
import { ObjectId } from 'mongodb';
import * as Dataloader from 'dataloader';

export class RegistrationDataSource extends BaseDataSource {
  private loader: Dataloader<string, Registration, string>;

  constructor() {
    super();
  }

  initialize(config: DataSourceConfig<ApolloContext>) {
    super.initialize(config);
    this.loader = new Dataloader(this.loaderFn.bind(this));
  }

  private async loaderFn(ids: string[]): Promise<Registration[]> {
    const data = await registrationRepository.find({ _id: { $in: ids } }).exec();
    return data.map(RegistrationMapper.toRegistration.bind(this));
  }

  async getRegistration(id: ObjectId): Promise<Registration> {
    const event = this.loader.load(id.toString());
    return event;
  }

  async getEventRegistrations(eventId: ObjectId): Promise<Registration[]> {
    const teams = await registrationRepository.find({ eventId }).sort({ registeredOn: 1 }).exec();
    return teams.map(RegistrationMapper.toRegistration);
  }

  async getProgramRegistrations(programId: ObjectId): Promise<Registration[]> {
    const teams = await registrationRepository.find({ programId }).sort({ registeredOn: 1 }).exec();
    return teams.map(RegistrationMapper.toRegistration);
  }

  async setInvoicedOn(id: ObjectId, invoiceIssuedOn: Date): Promise<Registration> {
    const registration = await registrationRepository
      .findByIdAndUpdate(id, { invoiceIssuedOn }, { new: true })
      .exec();
    return RegistrationMapper.toRegistration(registration);
  }

  async clearInvoicedOn(id: ObjectId): Promise<Registration> {
    const registration = await registrationRepository
      .findByIdAndUpdate(id, { invoiceIssuedOn: null }, { new: true })
      .exec();
    return RegistrationMapper.toRegistration(registration);
  }

  async setPaidOn(id: ObjectId, paidOn: Date): Promise<Registration> {
    const registration = await registrationRepository
      .findByIdAndUpdate(id, { paidOn }, { new: true })
      .exec();
    return RegistrationMapper.toRegistration(registration);
  }

  async clearPaidOn(id: ObjectId): Promise<Registration> {
    const registration = await registrationRepository
      .findByIdAndUpdate(id, { paidOn: null }, { new: true })
      .exec();
    return RegistrationMapper.toRegistration(registration);
  }

  async setShippedOn(id: ObjectId, shippedOn: Date): Promise<Registration> {
    const registration = await registrationRepository
      .findByIdAndUpdate(id, { shippedOn }, { new: true })
      .exec();
    return RegistrationMapper.toRegistration(registration);
  }

  async clearShippedOn(id: ObjectId): Promise<Registration> {
    const registration = await registrationRepository
      .findByIdAndUpdate(id, { shippedOn: null }, { new: true })
      .exec();
    return RegistrationMapper.toRegistration(registration);
  }

  async setShipmentGroup(id: ObjectId, shipmentGroup: string): Promise<Registration> {
    const registration = await registrationRepository
      .findByIdAndUpdate(id, { shipmentGroup }, { new: true })
      .exec();
    return RegistrationMapper.toRegistration(registration);
  }
}
