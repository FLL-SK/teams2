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
import {
  User,
  Event,
  CreateEventInput,
  CreateEventPayload,
  EventTeam,
  EventFilterInput,
} from '../../generated/graphql';
import { EventMapper, EventTeamMapper, UserMapper } from '../mappers';
import { ObjectId } from 'mongodb';
import { FilterQuery } from 'mongoose';
import * as Dataloader from 'dataloader';

export class EventDataSource extends BaseDataSource {
  private loader: Dataloader<string, Event, string>;

  constructor() {
    super();
  }

  initialize(config: DataSourceConfig<ApolloContext>) {
    super.initialize(config);
    this.loader = new Dataloader(this.loaderFn.bind(this));
  }

  private async loaderFn(ids: string[]): Promise<Event[]> {
    const data = await eventRepository.find({ _id: { $in: ids } }).exec();
    return data.map(EventMapper.toEvent.bind(this));
  }

  async getEvent(id: ObjectId): Promise<Event> {
    //const event=  EventMapper.toEvent(await eventRepository.findById(id).exec());
    const event = this.loader.load(id.toString());
    return event;
  }

  async getEvents(filter: EventFilterInput): Promise<Event[]> {
    const q: FilterQuery<Event> = {};
    if (filter.programId) {
      q.programId = filter.programId;
    }
    if (filter.isActive) {
      q.date = { $not: { $lt: new Date() } };
    }
    const events = await eventRepository.find(q).exec();
    return events.map(EventMapper.toEvent);
  }

  async createEvent(input: CreateEventInput): Promise<CreateEventPayload> {
    const u: EventData = { ...input, managersIds: [] };
    const nu = await eventRepository.create(u);
    return { event: EventMapper.toEvent(nu) };
  }

  async deleteEvent(id: ObjectId): Promise<Event> {
    const teams = await this.getEventTeams(id);
    if (teams.length > 0) {
      return null;
    }
    const u = await eventRepository.findByIdAndDelete(id).exec();
    return EventMapper.toEvent(u);
  }

  async getEventsManagedBy(managerId: ObjectId): Promise<Event[]> {
    const events = await eventRepository.findEventsManagedByUser(managerId);
    return events.map((t) => EventMapper.toEvent(t));
  }

  async addTeamToEvent(eventId: ObjectId, teamId: ObjectId): Promise<Event> {
    const et: EventTeamData = { eventId, teamId, registeredOn: new Date() };
    await eventTeamRepository.create(et);
    const event = await eventRepository.findById(eventId).exec();

    return EventMapper.toEvent(event);
  }

  async removeTeamFromEvent(eventId: ObjectId, teamId: ObjectId): Promise<Event> {
    await eventTeamRepository.deleteOne({ eventId, teamId }).exec();
    const event = await eventRepository.findById(eventId).exec();
    return EventMapper.toEvent(event);
  }

  async addEventManager(eventId: ObjectId, userId: ObjectId): Promise<Event> {
    const event = await eventRepository
      .findOneAndUpdate({ _id: eventId }, { $addToSet: { managersIds: userId } }, { new: true })
      .exec();
    return EventMapper.toEvent(event);
  }

  async removeEventManager(eventId: ObjectId, userId: ObjectId): Promise<Event> {
    const event = await eventRepository
      .findOneAndUpdate({ _id: eventId }, { $pull: { managersIds: userId } }, { new: true })
      .exec();
    return EventMapper.toEvent(event);
  }

  async getEventTeams(eventId: ObjectId): Promise<EventTeam[]> {
    const teams = await eventTeamRepository.find({ eventId }).sort({ registeredOn: 1 }).exec();
    return teams.map(EventTeamMapper.toEventTeam);
  }

  async getEventManagers(eventId: ObjectId): Promise<User[]> {
    const event = await eventRepository.findById(eventId).exec();
    if (!event) {
      throw new Error('Event not found');
    }
    const users = await Promise.all(
      event.managersIds.map(async (u) => userRepository.findById(u).exec())
    );
    return users.filter((e) => !!e).map(UserMapper.toUser);
  }
}
