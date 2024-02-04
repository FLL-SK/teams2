import { RegisteredTeamFragmentFragment } from '../../../_generated/graphql';
import { formatFullName } from '../../../utils/format-fullname';
import { exportRegistrations as exportRegisteredTeams } from '../../../utils/export-registrations';

interface CoachType {
  name: string;
  email: string;
  phone?: string | null;
}

export const handleExportRegisteredTeams = (
  programName: string,
  eventName: string,
  regs: RegisteredTeamFragmentFragment[],
) => {
  const teams = regs.map((r) => {
    const cc: { coach1?: CoachType; coach2?: CoachType; coach3?: CoachType } = {};
    if (r.coaches) {
      if (r.coaches.length > 0) {
        cc.coach1 = {
          name: formatFullName(r.coaches[0].firstName, r.coaches[0].lastName),
          email: r.coaches[0].username,
          phone: r.coaches[0].phone,
        };
      }
      if (r.coaches.length > 1) {
        cc.coach2 = {
          name: formatFullName(r.coaches[1].firstName, r.coaches[1].lastName),
          email: r.coaches[1].username,
          phone: r.coaches[1].phone,
        };
      }

      if (r.coaches.length > 2) {
        cc.coach3 = {
          name: formatFullName(r.coaches[2].firstName, r.coaches[2].lastName),
          email: r.coaches[2].username,
          phone: r.coaches[2].phone,
        };
      }
    }

    return { ...r, childrenCount: r.boyCount + r.girlCount, eventName, ...cc };
  });
  exportRegisteredTeams(programName, teams);
};
