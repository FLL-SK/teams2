import { ProgramData } from '../../models';
import { Product, Program } from '../../_generated/graphql';

export const ProgramMapper = {
  toProgram(program: ProgramData | null | undefined): Program | null {
    if (!program) {
      return null;
    }
    const u: Omit<Required<Program>, '__typename'> = {
      id: program._id!,

      name: program.name,
      description: program.description ?? null,

      logoUrl: program.logoUrl ?? null,
      color: program.color ?? null,

      conditions: program.conditions ?? null,

      startDate: program.startDate,
      endDate: program.endDate,

      maxTeams: program.maxTeams ?? null,
      maxTeamSize: program.maxTeamSize ?? null,
      teamRegSequence: program.teamRegSequence,

      group: program.group ?? null,
      regTypesAllowed: program.regTypesAllowed,

      managersIds: program.managersIds ?? [],

      deletedOn: program.deletedOn ?? null,
      deletedBy: program.deletedBy ?? null,

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
  toProduct(program: Program | null | undefined): Product | null {
    if (!program) {
      return null;
    }
    const u: Omit<Required<Product>, '__typename'> = {
      id: program.id,
      type: 'PROGRAM',
      name: program.name,
      group: program.group ?? '',
      note: null,
      price: 0,
    };
    return u;
  },
};
