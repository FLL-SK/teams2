import { ObjectId } from 'mongodb';
import { RegisterTeamInput, Event } from '../generated/graphql';
import { EventMapper } from '../graphql/mappers';
import { EventData, EventDocument, eventRepository } from '../models';

export class EventBL {
  public data: EventDocument;

  constructor(event: EventDocument) {
    this.data = event;
  }

  static async load(eventId: ObjectId): Promise<EventBL | null> {
    const ev = await eventRepository.findById(eventId).exec();
    return ev ? new EventBL(ev) : null;
  }

  async save() {
    await this.data.save();
  }

  toEvent(): Event {
    return EventMapper.toEvent(this.data);
  }

  public async registerTeam(input: RegisterTeamInput) {
    const { teamId, billTo, shipTo, items } = input;
    // add team to event
    if (!this.data.teamsIds.find((t) => t.equals(teamId))) {
      this.data.teamsIds.push(teamId);
      await this.save();
    }
    // create invoice
  }
}
