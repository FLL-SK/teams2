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

  async getEventTeams(eventId: ObjectId): Promise<Registration[]> {
    const teams = await registrationRepository.find({ eventId }).sort({ registeredOn: 1 }).exec();
    return teams.map(RegistrationMapper.toRegistration);
  }

  async getProgramTeams(programId: ObjectId): Promise<Registration[]> {
    const teams = await registrationRepository.find({ programId }).sort({ registeredOn: 1 }).exec();
    return teams.map(RegistrationMapper.toRegistration);
  }
}
