import { DataSourceConfig } from 'apollo-datasource';
import { ApolloContext } from '../apollo-context';
import { BaseDataSource } from './_base.datasource';
import {
  EventData,
  eventRepository,
  RegistrationData,
  registrationRepository,
  userRepository,
} from '../../models';
import {
  User,
  Event,
  CreateEventInput,
  CreateEventPayload,
  EventFilterInput,
  UpdateEventInput,
  UpdateEventPayload,
} from '../../generated/graphql';
import { EventMapper, UserMapper } from '../mappers';
import { ObjectId } from 'mongodb';
import { FilterQuery } from 'mongoose';
import * as Dataloader from 'dataloader';
import { logger } from '@teams2/logger';

export class EventDataSource extends BaseDataSource {
  private loader: Dataloader<string, Event, string>;

  constructor() {
    super();
    this.logBase = logger('DS:Event');
  }

  initialize(config: DataSourceConfig<ApolloContext>) {
    super.initialize(config);
    this.loader = new Dataloader(this.loaderFn.bind(this));
  }

  private async loaderFn(ids: string[]): Promise<Event[]> {
    const oids = ids.map((id) => new ObjectId(id));
    const rec = await eventRepository.find({ _id: { $in: ids } }).exec();
    const data = oids.map((id) => rec.find((e) => e._id.equals(id)) || null);
    return data.map(EventMapper.toEvent.bind(this));
  }

  async getEvent(id: ObjectId): Promise<Event> {
    const event = this.loader.load(id.toString());
    return event;
  }

  async getEvents(filter: EventFilterInput): Promise<Event[]> {
    const log = this.logBase.extend('getEvents');
    const q: FilterQuery<Event> = {};
    if (filter.programId) {
      q.programId = filter.programId;
    }
    if (filter.isActive) {
      q.date = { $not: { $lt: new Date() } };
    }
    log.debug('filter=%o', q);

    const events = await eventRepository.find(q).sort({ date: 1, name: 1 }).exec();
    log.debug('Found %o', events);
    return events.map(EventMapper.toEvent);
  }

  async createEvent(input: CreateEventInput): Promise<CreateEventPayload> {
    this.userGuard.isAdmin() || this.userGuard.notAuthorized();
    const u: EventData = { ...input, managersIds: [] };
    const nu = await eventRepository.create(u);
    return { event: EventMapper.toEvent(nu) };
  }

  async updateEvent(id: ObjectId, input: UpdateEventInput): Promise<UpdateEventPayload> {
    this.userGuard.isAdmin() ||
      (await this.userGuard.isEventManager(id)) ||
      this.userGuard.notAuthorized();
    const u: Partial<EventData> = input;
    const nu = await eventRepository.findByIdAndUpdate(id, u, { new: true }).exec();
    return { event: EventMapper.toEvent(nu) };
  }

  async deleteEvent(id: ObjectId): Promise<Event> {
    this.userGuard.isAdmin() || this.userGuard.notAuthorized();
    const teams = await registrationRepository.find({ eventId: id }).lean().exec();
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

  async addEventManager(eventId: ObjectId, userId: ObjectId): Promise<Event> {
    this.userGuard.isAdmin() ||
      (await this.userGuard.isEventManager(eventId)) ||
      this.userGuard.notAuthorized();
    const event = await eventRepository
      .findOneAndUpdate({ _id: eventId }, { $addToSet: { managersIds: userId } }, { new: true })
      .exec();
    return EventMapper.toEvent(event);
  }

  async removeEventManager(eventId: ObjectId, userId: ObjectId): Promise<Event> {
    this.userGuard.isAdmin() ||
      (await this.userGuard.isEventManager(eventId)) ||
      this.userGuard.notAuthorized();
    const event = await eventRepository
      .findOneAndUpdate({ _id: eventId }, { $pull: { managersIds: userId } }, { new: true })
      .exec();
    return EventMapper.toEvent(event);
  }

  async getEventManagers(eventId: ObjectId): Promise<User[]> {
    if (!this.userGuard.isAdmin()) {
      return [];
    }

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
