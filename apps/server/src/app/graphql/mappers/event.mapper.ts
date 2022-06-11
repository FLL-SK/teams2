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

      date: event.date,
      registrationEnd: event.registrationEnd,

      teamsIds: event.teamsIds,
      managersIds: event.managersIds,

      publishedOn: event.publishedOn,
      publishedBy: event.publishedBy,

      deletedOn: event.deletedOn,
      deletedBy: event.deletedBy,

      teams: [],
      managers: [],
      program: null,
    };
    return u;
  },
};
