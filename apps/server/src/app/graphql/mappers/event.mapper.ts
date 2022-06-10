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
      date: event.date,
      programId: event.programId,
      teamsIds: event.teamsIds,
      managersIds: event.managersIds,

      registrationStart: event.registrationStart,
      registrationEnd: event.registrationEnd,

      deletedOn: event.deletedOn,
      deletedBy: event.deletedBy,

      teams: [],
      managers: [],
      program: null,
    };
    return u;
  },
};
