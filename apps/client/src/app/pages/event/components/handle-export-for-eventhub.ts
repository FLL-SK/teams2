import { RegisteredTeamFragmentFragment } from '../../../_generated/graphql';
import { exportRegistrationsForEventHub } from '../../../utils/export-registrations-event-hub';
import { formatPhone } from '../../../utils/format-phone';

export const handleExportForEventHub = (
  programName: string,
  eventName: string,
  regs: RegisteredTeamFragmentFragment[],
) => {
  const teams = [];
  for (const reg of regs) {
    for (const c of reg.coaches ?? []) {
      const t = {
        email: c.username,
        firstName: c.firstName,
        lastName: c.lastName,
        phone: formatPhone(c.phone),
        teamName: reg.name,
        teamNo: reg.teamNo ?? '',
        teamCountry: 'Slovakia',
        teamRegion: 'Slovakia',
      };
      teams.push(t);
    }
  }

  exportRegistrationsForEventHub(programName + ' ' + eventName, teams);
};
