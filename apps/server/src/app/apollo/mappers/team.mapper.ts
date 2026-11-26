import { TeamData } from '../../models';
import { Team } from '../../_generated/graphql';
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
      tagIds: team.tagIds,

      address: AddressMapper.toAddress(team.address),
      billTo: AddressMapper.toAddress(team.billTo),
      shipTo: AddressMapper.toAddress(team.shipTo),
      useBillTo: team.useBillTo,

      createdOn: team.createdOn,
      deletedOn: team.deletedOn,
      deletedBy: team.deletedBy,

      coaches: [],
      registrations: [],
      tags: [],
    };
    return u;
  },

  /**
   * Verejná podoba tímu pre používateľa bez práva čítať detaily (#289): názov tímu,
   * názov organizácie a mesto; bez adries, kontaktov, trénerov a tagov.
   */
  toPublicTeam(team: Team | null | undefined): Team | null {
    if (!team) {
      return null;
    }
    return {
      ...team,
      coachesIds: [],
      tagIds: [],
      address: {
        id: team.address?.id ?? null,
        name: team.address?.name ?? '',
        city: team.address?.city ?? '',
        street: '',
        zip: '',
        countryCode: team.address?.countryCode ?? null,
      },
      billTo: null,
      shipTo: null,
      useBillTo: null,
      deletedBy: null,
    };
  },
};
