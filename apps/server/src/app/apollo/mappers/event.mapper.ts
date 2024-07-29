import { EventData } from '../../models';
import { Event, Product } from '../../_generated/graphql';

export const EventMapper = {
  toEvent(event: EventData | null | undefined): Event | null {
    if (!event) {
      return null;
    }
    const u: Omit<Required<Event>, '__typename'> = {
      id: event._id,
      name: event.name,
      programId: event.programId,
      conditions: event.conditions,
      ownFeesAllowed: event.ownFeesAllowed,
      maxTeams: event.maxTeams,

      date: event.date,
      registrationEnd: event.registrationEnd,

      managersIds: event.managersIds,

      deletedOn: event.deletedOn,
      deletedBy: event.deletedBy,

      invoiceItems: [],
      managers: [],
      program: null,
      registrationsCount: 0,
    };
    return u;
  },
  toProduct(event: EventData | null | undefined): Product | null {
    if (!event) {
      return null;
    }
    const u: Omit<Required<Product>, '__typename'> = {
      id: event._id,
      type: 'EVENT',
      name: event.name,
      group: event.programId.toString(),
      note: null,
      price: 0,
    };
    return u;
  },
};
