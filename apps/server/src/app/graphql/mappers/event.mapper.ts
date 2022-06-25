import { EventData } from '../../models';
import { Event } from '../../generated/graphql';
import { InvoiceItemMapper } from './invoice-item.mapper';

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

      teamsIds: event.teamsIds,
      managersIds: event.managersIds,

      deletedOn: event.deletedOn,
      deletedBy: event.deletedBy,

      invoiceItems: [],
      teams: [],
      managers: [],
      program: null,
    };
    return u;
  },
};
