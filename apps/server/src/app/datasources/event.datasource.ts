import { DataSourceConfig } from 'apollo-datasource';

import { ApolloContext } from '../graphql/apollo-context';

import { BaseDataSource } from './_base.datasource';
import { EventData, eventRepository, teamRepository, UserData, userRepository } from '../models';
import {
  CreateUserInput,
  CreateUserPayload,
  Team,
  User,
  Event,
  CreateEventInput,
  CreateEventPayload,
  UpdateEventInput,
  UpdateEventPayload,
} from '../generated/graphql';
import { EventMapper, TeamMapper, UserMapper } from '../graphql/mappers';
import { ObjectId } from 'mongodb';

export class EventDataSource extends BaseDataSource {
  constructor() {
    super();
  }

  initialize(config: DataSourceConfig<ApolloContext>) {
    super.initialize(config);
  }

  async getEvent(id: ObjectId): Promise<Event> {
    return EventMapper.toEvent(await eventRepository.findById(id).exec());
  }

  async getEvents(): Promise<Event[]> {
    const events = await eventRepository.find().exec();
    return events.map(EventMapper.toEvent);
  }

  async createEvent(input: CreateEventInput): Promise<CreateEventPayload> {
    const u: EventData = { ...input, teamsIds: [], managersIds: [] };
    const nu = await eventRepository.create(u);
    return { event: EventMapper.toEvent(nu) };
  }

  async updateEvent(id: ObjectId, input: UpdateEventInput): Promise<UpdateEventPayload> {
    const u: Partial<EventData> = input;
    const nu = await eventRepository.findByIdAndUpdate(id, u).exec();
    return { event: EventMapper.toEvent(nu) };
  }

  async deleteEvent(id: ObjectId): Promise<Event> {
    const u = await eventRepository.findByIdAndDelete(id).exec();
    return EventMapper.toEvent(u);
  }

  async getEventsManagedBy(managerId: ObjectId): Promise<Event[]> {
    const events = await eventRepository.findEventsManagedByUser(managerId);
    return events.map((t) => EventMapper.toEvent(t));
  }

  async addTeamToEvent(eventId: ObjectId, teamId: ObjectId): Promise<Event> {
    const event = await eventRepository
      .findOneAndUpdate(eventId, { teamsIds: { $addToSet: teamId } }, { new: true })
      .exec();
    return EventMapper.toEvent(event);
  }

  async removeTeamFromEvent(eventId: ObjectId, teamId: ObjectId): Promise<Event> {
    const event = await eventRepository
      .findOneAndUpdate(eventId, { teamsIds: { $pull: teamId } }, { new: true })
      .exec();
    return EventMapper.toEvent(event);
  }

  async addEventManager(eventId: ObjectId, userId: ObjectId): Promise<Event> {
    const event = await eventRepository
      .findOneAndUpdate(eventId, { managersIds: { $addToSet: userId } }, { new: true })
      .exec();
    return EventMapper.toEvent(event);
  }

  async removeEventManager(eventId: ObjectId, userId: ObjectId): Promise<Event> {
    const event = await eventRepository
      .findOneAndUpdate(eventId, { managersIds: { $pull: userId } }, { new: true })
      .exec();
    return EventMapper.toEvent(event);
  }
}
