import { TeamData } from '../../models';
import { Team } from '../../generated/graphql';
import { AddressMapper } from './address.mapper';

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

      billTo: AddressMapper.toAddress(team.billTo),
      shipTo: AddressMapper.toAddress(team.shipTo),
      useBillTo: team.useBillTo,

      coaches: [],
      events: [],
    };
    return u;
  },
};
