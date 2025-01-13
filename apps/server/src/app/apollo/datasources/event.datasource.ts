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
  PricelistItemInput,
} from '../../_generated/graphql';
import { EventMapper, UserMapper } from '../mappers';
import { ObjectId } from 'mongodb';
import { FilterQuery } from 'mongoose';
import Dataloader from 'dataloader';
import { logger } from '@teams2/logger';
import { emailEventManagerAdded } from '../../utils/emails';
import { issueFoodInvoices, notifyEventFoodItemChanged } from '../../domains/event';

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
      q.archivedOn = null;
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

  async addFoodType(eventId: ObjectId): Promise<Event> {
    this.userGuard.isAdmin() ||
      (await this.userGuard.isEventManager(eventId)) ||
      this.userGuard.notAuthorized('Add food type');
    const foodType = { n: 'Nový typ stravy', up: 0 };
    const event = await eventRepository
      .findOneAndUpdate({ _id: eventId }, { $push: { foodTypes: foodType } }, { new: true })
      .exec();
    if (!event) {
      throw new Error('Event not found');
    }
    return EventMapper.toEvent(event);
  }

  async removeFoodType(eventId: ObjectId, foodTypeId: ObjectId): Promise<Event> {
    this.userGuard.isAdmin() ||
      (await this.userGuard.isEventManager(eventId)) ||
      this.userGuard.notAuthorized('Remove food type');
    const ex = await registrationRepository
      .findOne({
        eventId,
        'foodOrder.items.productId': foodTypeId,
      })
      .exec();
    if (ex) {
      throw new Error('Food type is in use');
    }
    const event = await eventRepository
      .findOneAndUpdate(
        { _id: eventId },
        { $pull: { foodTypes: { _id: foodTypeId } } },
        { new: true },
      )
      .exec();
    if (!event) {
      throw new Error('Event not found');
    }
    return EventMapper.toEvent(event);
  }

  async updateFoodType(eventId: ObjectId, foodType: PricelistItemInput): Promise<Event> {
    this.userGuard.isAdmin() ||
      (await this.userGuard.isEventManager(eventId)) ||
      this.userGuard.notAuthorized('Update food type');
    const event = await eventRepository
      .findOneAndUpdate(
        { _id: eventId, 'foodTypes._id': foodType.id },
        { $set: { 'foodTypes.$.up': foodType.up, 'foodTypes.$.n': foodType.n } },
        { new: true },
      )
      .exec();

    if (!event) {
      throw new Error('Event not found');
    }

    // notify coaches about food type change
    notifyEventFoodItemChanged(
      this.context,
      eventId,
      foodType,
      event.foodTypes.find((f) => f._id.equals(foodType.id)),
    );

    return EventMapper.toEvent(event);
  }

  async updateFoodOrderDeadline(eventId: ObjectId, deadline: Date): Promise<Event> {
    this.userGuard.isAdmin() ||
      (await this.userGuard.isEventManager(eventId)) ||
      this.userGuard.notAuthorized('Update food order deadline');
    const event = await eventRepository
      .findOneAndUpdate({ _id: eventId }, { $set: { foodOrderDeadline: deadline } }, { new: true })
      .exec();
    if (!event) {
      throw new Error('Event not found');
    }
    return EventMapper.toEvent(event);
  }

  async inviteTeam(eventId: ObjectId, teamId: ObjectId): Promise<Event> {
    this.userGuard.isAdmin() ||
      (await this.userGuard.isEventManager(eventId)) ||
      this.userGuard.notAuthorized('Invite team');
    const event = await eventRepository
      .findOneAndUpdate({ _id: eventId }, { $addToSet: { invitedTeamsIds: teamId } }, { new: true })
      .exec();
    if (!event) {
      throw new Error('Event not found');
    }
    return EventMapper.toEvent(event);
  }

  async uninviteTeam(eventId: ObjectId, teamId: ObjectId): Promise<Event> {
    this.userGuard.isAdmin() ||
      (await this.userGuard.isEventManager(eventId)) ||
      this.userGuard.notAuthorized('Uninvite team');
    const event = await eventRepository
      .findOneAndUpdate({ _id: eventId }, { $pull: { invitedTeamsIds: teamId } }, { new: true })
      .exec();
    if (!event) {
      throw new Error('Event not found');
    }
    return EventMapper.toEvent(event);
  }

  async archiveEvent(eventId: ObjectId): Promise<Event> {
    this.userGuard.isAdmin() ||
      (await this.userGuard.isEventManager(eventId)) ||
      (await this.userGuard.isProgramManager(eventId)) ||
      this.userGuard.notAuthorized('Archive event');

    const ne = await eventRepository.archiveEvent(eventId, this.userGuard.userId);
    return EventMapper.toEvent(ne);
  }

  async unarchiveEvent(eventId: ObjectId): Promise<Event> {
    this.userGuard.isAdmin() ||
      (await this.userGuard.isEventManager(eventId)) ||
      (await this.userGuard.isProgramManager(eventId)) ||
      this.userGuard.notAuthorized('Unarchive event');

    const ne = await eventRepository.unarchiveEvent(eventId, this.userGuard.userId);
    return EventMapper.toEvent(ne);
  }

  async toggleEventFoodOrderEnabled(eventId: ObjectId, enable?: boolean): Promise<Event> {
    this.userGuard.isAdmin() ||
      (await this.userGuard.isEventManager(eventId)) ||
      this.userGuard.notAuthorized('Toggle food order enabled');

    const ne = await eventRepository.toggleFoodOrderEnabled(eventId, this.userGuard.userId, enable);
    return EventMapper.toEvent(ne);
  }
}
