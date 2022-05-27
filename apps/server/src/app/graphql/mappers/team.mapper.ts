import { TeamData } from '../../models';
import { Team } from '../../generated/graphql';

export const TeamMapper = {
  toTeam(team: TeamData | null | undefined): Team | null {
    if (!team) {
      return null;
    }
    const u: Omit<Required<Team>, '__typename'> = {
      id: team._id,
      name: team.name,
      coachesIds: team.coachesIds,
      deletedOn: team.deletedOn,
      deletedBy: team.deletedBy,

      coaches: [],
      events: [],
    };
    return u;
  },
};
