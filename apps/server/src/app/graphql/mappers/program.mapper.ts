import { ProgramData } from '../../models';
import { Program } from '../../generated/graphql';

export const ProgramMapper = {
  toProgram(program: ProgramData | null | undefined): Program | null {
    if (!program) {
      return null;
    }
    const u: Omit<Required<Program>, '__typename'> = {
      id: program._id,
      name: program.name,
      startDate: program.startDate,
      endDate: program.endDate,
      managersIds: program.managersIds,
      deletedOn: program.deletedOn,
      deletedBy: program.deletedBy,

      managers: [],
      events: [],
    };
    return u;
  },
};
