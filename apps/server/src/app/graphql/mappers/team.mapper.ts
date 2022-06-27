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

      address: AddressMapper.toAddress(team.address),
      billTo: AddressMapper.toAddress(team.billTo),
      shipTo: AddressMapper.toAddress(team.shipTo),
      useBillTo: team.useBillTo,

      deletedOn: team.deletedOn,
      deletedBy: team.deletedBy,

      coaches: [],
      events: [],
    };
    return u;
  },
};
