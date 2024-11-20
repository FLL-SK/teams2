import { RegistrationListFragmentFragment } from '../../../_generated/graphql';
import { formatFullName } from '../../../utils/format-fullname';
import { exportRegistrations as exportRegisteredTeams } from '../../../utils/export-registrations';

interface CoachType {
  name: string;
  email: string;
  phone?: string | null;
}

export const handleExportRegisteredTeams = (
  programName: string,
  regs: RegistrationListFragmentFragment[],
) => {
  const teams = regs.map((r) => {
    const cc: { coach1?: CoachType; coach2?: CoachType; coach3?: CoachType } = {};
    if (r.team.coaches) {
      if (r.team.coaches.length > 0) {
        cc.coach1 = {
          name: formatFullName(r.team.coaches[0].firstName, r.team.coaches[0].lastName),
          email: r.team.coaches[0].username,
          phone: r.team.coaches[0].phone,
        };
      }
      if (r.team.coaches.length > 1) {
        cc.coach2 = {
          name: formatFullName(r.team.coaches[1].firstName, r.team.coaches[1].lastName),
          email: r.team.coaches[1].username,
          phone: r.team.coaches[1].phone,
        };
      }

      if (r.team.coaches.length > 2) {
        cc.coach3 = {
          name: formatFullName(r.team.coaches[2].firstName, r.team.coaches[2].lastName),
          email: r.team.coaches[2].username,
          phone: r.team.coaches[2].phone,
        };
      }
    }

    return {
      name: r.team.name,
      registeredOn: r.createdOn,
      type: r.type,
      childrenCount: r.boyCount + r.girlCount,
      eventName: r.event?.name ?? '',
      coachCount: r.team.coaches.length,
      address: r.team.address,
      ...cc,
    };
  });
  exportRegisteredTeams(programName, teams);
};
