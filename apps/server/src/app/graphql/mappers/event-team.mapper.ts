import { EventTeamData } from '../../models';
import { EventTeam } from '../../generated/graphql';

export const EventTeamMapper = {
  toEventTeam(eventTeam: EventTeamData | null | undefined): EventTeam | null {
    if (!eventTeam) {
      return null;
    }
    const u: Omit<Required<EventTeam>, '__typename'> = {
      id: eventTeam._id,
      teamId: eventTeam.teamId,
      eventId: eventTeam.eventId,
      registeredOn: eventTeam.registeredOn,
      teamSize: eventTeam.teamSize,
      sizeConfirmedOn: eventTeam.sizeConfirmedOn,

      team: null,
      event: null,
    };
    return u;
  },
};
