import { ProgramData } from '../../models';
import { Program } from '../../generated/graphql';
import { InvoiceItemMapper } from './invoice-item.mapper';

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
      conditions: program.conditions,

      managersIds: program.managersIds,

      deletedOn: program.deletedOn,
      deletedBy: program.deletedBy,

      invoiceItems: [],
      managers: [],
      events: [],
    };
    return u;
  },
};
