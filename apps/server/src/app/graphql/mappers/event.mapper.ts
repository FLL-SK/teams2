import { EventData } from '../../models';
import { Event } from '../../generated/graphql';

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

      date: event.date,
      registrationEnd: event.registrationEnd,

      managersIds: event.managersIds,

      deletedOn: event.deletedOn,
      deletedBy: event.deletedBy,

      invoiceItems: [],
      registrations: [],
      managers: [],
      program: null,
      registrationsCount: 0,
    };
    return u;
  },
};
