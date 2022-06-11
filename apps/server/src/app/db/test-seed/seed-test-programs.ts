import { ProgramData, programRepository, userRepository } from '../../models';
import { logger } from '@teams2/logger';

type TestSeedData = ProgramData & {
  managers?: string[];
};

export const seedTestProgramData: TestSeedData[] = [
  {
    name: 'Program1',
    managersIds: [],
    managers: ['progmgr1@test', 'progmgr2@test'],
  },
  {
    name: 'Program2',
    managersIds: [],
    managers: ['progmgr2@test'],
  },
  {
    name: 'Program3-not active',
    managersIds: [],
    managers: ['progmgr2@test'],
  },
];

const log = logger('testseed:Programs');

export async function seedTestPrograms() {
  for (const d of seedTestProgramData) {
    const p: ProgramData = {
      name: d.name,
      managersIds: d.managersIds,
    };

    for (const username of d.managers) {
      const u = await userRepository.findOne({ username });
      if (u) {
        p.managersIds.push(u._id);
      }
    }

    const nu = await programRepository.create(p);

    log.debug(`Program created name=%s id=%s`, nu.name, nu._id);
  }
}
