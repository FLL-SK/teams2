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
} from '../../_generated/graphql';
import { EventMapper, UserMapper } from '../mappers';
import { ObjectId } from 'mongodb';
import { FilterQuery } from 'mongoose';
import Dataloader from 'dataloader';
import { logger } from '@teams2/logger';
import { emailEventManagerAdded } from '../../utils/emails';
import { issueFoodInvoices } from '../../domains/event';

const logBase = logger('DS:Event');

export class EventDataSource extends BaseDataSource {
  private loader: Dataloader<string, Event, string>;

  protected override _initialize() {
    this.loader = new Dataloader(this.loaderFn.bind(this));
  }

  private async loaderFn(ids: string[]): Promise<Event[]> {
    const oids = ids.map((id) => new ObjectId(id));
    const rec = await eventRepository.find({ _id: { $in: ids } }).exec();
    const data = oids.map((id) => rec.find((e) => e._id.equals(id)) ?? null);
    return data.map(EventMapper.toEvent.bind(this));
  }

  async getEvent(id: ObjectId): Promise<Event> {
    if (!id) return null;
    const event = this.loader.load(id.toString());
    return event;
  }

  async getEvents(filter: EventFilterInput): Promise<Event[]> {
    const log = logBase.extend('getEvents');
    const q: FilterQuery<Event> = {};
    if (filter.programId) {
      q.programId = filter.programId;
    }
    if (filter.isActive) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      q.date = { $not: { $lt: today } };
      q.deletedOn = null;
    }
    log.debug('filter=%o', q);

    const events = await eventRepository.find(q).sort({ programId: 1, date: 1 }).exec();
    log.debug('Found %o', events);
    return events.map(EventMapper.toEvent);
  }

  async createEvent(input: CreateEventInput): Promise<CreateEventPayload> {
    this.userGuard.isAdmin() || this.userGuard.notAuthorized('Create event');
    const { maxTeams, ...evtData } = input;
    const u: EventData = {
      ...evtData,
      managersIds: [],
      foodTypes: [],
    };
    if (maxTeams > 0) {
      u.maxTeams = maxTeams;
    }
    const nu = await eventRepository.create(u);
    return { event: EventMapper.toEvent(nu) };
  }

  async updateEvent(id: ObjectId, input: UpdateEventInput): Promise<UpdateEventPayload> {
    this.userGuard.isAdmin() ||
      (await this.userGuard.isEventManager(id)) ||
      this.userGuard.notAuthorized('Update event');
    const u: Partial<EventData> = input;
    const nu = await eventRepository.findByIdAndUpdate(id, u, { new: true }).exec();
    return { event: EventMapper.toEvent(nu) };
  }

  async deleteEvent(id: ObjectId): Promise<Event> {
    this.userGuard.isAdmin() || this.userGuard.notAuthorized('Delete event');
    const tq: Partial<RegistrationData> = { eventId: id, canceledOn: null };
    const teams = await registrationRepository.find(tq).lean().exec();
    if (teams.length > 0) {
      return null;
    }
    const u: Partial<EventData> = { deletedOn: new Date(), deletedBy: this.context.user._id };
    const ne = await eventRepository.findByIdAndUpdate(id, u, { new: true }).exec();
    return EventMapper.toEvent(ne);
  }

  async undeleteEvent(id: ObjectId): Promise<Event> {
    this.userGuard.isAdmin() || this.userGuard.notAuthorized('Undelete event');
    const u: Partial<EventData> = { deletedOn: null, deletedBy: this.context.user._id };
    const ne = await eventRepository.findByIdAndUpdate(id, u, { new: true }).exec();
    return EventMapper.toEvent(ne);
  }

  async getEventsManagedBy(managerId: ObjectId): Promise<Event[]> {
    const events = await eventRepository.findEventsManagedByUser(managerId);
    return events.map((t) => EventMapper.toEvent(t));
  }

  async addEventManager(eventId: ObjectId, userId: ObjectId): Promise<Event> {
    this.userGuard.isAdmin() ||
      (await this.userGuard.isEventManager(eventId)) ||
      this.userGuard.notAuthorized('Add event manager');
    const event = await eventRepository
      .findOneAndUpdate({ _id: eventId }, { $addToSet: { managersIds: userId } }, { new: true })
      .exec();
    emailEventManagerAdded(eventId, userId);
    return EventMapper.toEvent(event);
  }

  async removeEventManager(eventId: ObjectId, userId: ObjectId): Promise<Event> {
    this.userGuard.isAdmin() ||
      (await this.userGuard.isEventManager(eventId)) ||
      this.userGuard.notAuthorized('Remove event manager');
    const event = await eventRepository
      .findOneAndUpdate({ _id: eventId }, { $pull: { managersIds: userId } }, { new: true })
      .exec();
    return EventMapper.toEvent(event);
  }

  async getEventManagers(eventId: ObjectId): Promise<User[]> {
    if (!(this.userGuard.isAdmin() || (await this.userGuard.isEventManager(eventId)))) {
      return [];
    }

    const event = await eventRepository.findById(eventId).exec();
    if (!event) {
      throw new Error('Event not found');
    }
    const users = await Promise.all(
      event.managersIds.map(async (u) => userRepository.findById(u).exec()),
    );
    return users.filter((e) => !!e).map(UserMapper.toUser);
  }

  async issueFoodInvoices(eventId: ObjectId): Promise<number> {
    this.userGuard.isAdmin() ||
      (await this.userGuard.isEventManager(eventId)) ||
      this.userGuard.notAuthorized('Issue food invoices');
    return issueFoodInvoices(eventId, this.context);
  }
}
