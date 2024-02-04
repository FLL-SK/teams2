import { ProgramData } from '../../models';
import { Program } from '../../_generated/graphql';

export const ProgramMapper = {
  toProgram(program: ProgramData | null | undefined): Program | null {
    if (!program) {
      return null;
    }
    const u: Omit<Required<Program>, '__typename'> = {
      id: program._id,

      name: program.name,
      description: program.description,

      logoUrl: program.logoUrl,
      color: program.color,

      conditions: program.conditions,

      startDate: program.startDate,
      endDate: program.endDate,

      maxTeams: program.maxTeams,
      maxTeamSize: program.maxTeamSize,

      group: program.group,
      classPackEnabled: program.classPackEnabled,

      managersIds: program.managersIds,

      deletedOn: program.deletedOn,
      deletedBy: program.deletedBy,

      invoiceItems: [],
      managers: [],
      events: [],
      registrations: [],

      regCount: 0,
      regUnconfirmed: 0,
      regNotInvoiced: 0,
      regUnpaid: 0,
      regNotShipped: 0,
      regSetCount: 0,
      teamsInvolved: 0,
    };
    return u;
  },
};
