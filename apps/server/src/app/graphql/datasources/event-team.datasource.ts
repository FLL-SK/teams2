import { DataSourceConfig } from 'apollo-datasource';
import { ApolloContext } from '../apollo-context';
import { BaseDataSource } from './_base.datasource';
import {
  EventData,
  eventRepository,
  EventTeamData,
  eventTeamRepository,
  userRepository,
} from '../../models';
import { EventTeam } from '../../generated/graphql';
import { EventTeamMapper } from '../mappers';
import { ObjectId } from 'mongodb';
import * as Dataloader from 'dataloader';

export class EventTeamDataSource extends BaseDataSource {
  private loader: Dataloader<string, EventTeam, string>;

  constructor() {
    super();
  }

  initialize(config: DataSourceConfig<ApolloContext>) {
    super.initialize(config);
    this.loader = new Dataloader(this.loaderFn.bind(this));
  }

  private async loaderFn(ids: string[]): Promise<EventTeam[]> {
    const data = await eventTeamRepository.find({ _id: { $in: ids } }).exec();
    return data.map(EventTeamMapper.toEventTeam.bind(this));
  }

  async getEventTeam(id: ObjectId): Promise<EventTeam> {
    const event = this.loader.load(id.toString());
    return event;
  }

  async getEventTeams(eventId: ObjectId): Promise<EventTeam[]> {
    const teams = await eventTeamRepository.find({ eventId }).sort({ registeredOn: 1 }).exec();
    return teams.map(EventTeamMapper.toEventTeam);
  }
}
