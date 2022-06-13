import { DataSourceConfig } from 'apollo-datasource';

import { ApolloContext } from '../apollo-context';

import { BaseDataSource } from './_base.datasource';
import { EventData, eventRepository, teamRepository, userRepository } from '../../models';
import {
  Team,
  User,
  Event,
  CreateEventInput,
  CreateEventPayload,
  UpdateEventInput,
  UpdateEventPayload,
  InvoiceItemInput,
} from '../../generated/graphql';
import { EventMapper, TeamMapper, UserMapper } from '../mappers';
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
    const u: EventData = { ...input, teamsIds: [], managersIds: [], invoiceItems: [] };
    const nu = await eventRepository.create(u);
    return { event: EventMapper.toEvent(nu) };
  }

  async updateEvent(id: ObjectId, input: UpdateEventInput): Promise<UpdateEventPayload> {
    const u: Partial<EventData> = input;
    const nu = await eventRepository.findByIdAndUpdate(id, u, { new: true }).exec();
    return { event: EventMapper.toEvent(nu) };
  }

  async deleteEvent(id: ObjectId): Promise<Event> {
    const event = await eventRepository.findById(id).lean().exec();
    if (event.teamsIds.length > 0) {
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
    const event = await eventRepository
      .findOneAndUpdate({ _id: eventId }, { $addToSet: { teamsIds: teamId } }, { new: true })
      .exec();
    return EventMapper.toEvent(event);
  }

  async removeTeamFromEvent(eventId: ObjectId, teamId: ObjectId): Promise<Event> {
    const event = await eventRepository
      .findOneAndUpdate({ _id: eventId }, { $pull: { teamsIds: teamId } }, { new: true })
      .exec();
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

  async getEventTeams(eventId: ObjectId): Promise<Team[]> {
    const event = await eventRepository.findById(eventId).exec();
    if (!event) {
      throw new Error('Event not found');
    }
    const teams = await Promise.all(
      event.teamsIds.map(async (t) => teamRepository.findById(t).exec())
    );
    return teams.map(TeamMapper.toTeam);
  }

  async getEventManagers(eventId: ObjectId): Promise<User[]> {
    const event = await eventRepository.findById(eventId).exec();
    if (!event) {
      throw new Error('Event not found');
    }
    const users = await Promise.all(
      event.managersIds.map(async (u) => userRepository.findById(u).exec())
    );
    return users.map(UserMapper.toUser);
  }

  async updateEventInvoiceItems(eventId: ObjectId, items: InvoiceItemInput[]): Promise<Event> {
    const event = await eventRepository
      .findOneAndUpdate({ _id: eventId }, { invoiceItems: items }, { new: true })
      .exec();
    return EventMapper.toEvent(event);
  }
}
