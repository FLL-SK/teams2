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
    description: '**Program1 description**\n* a\n* b\n* c',
  },
  {
    name: 'Program2',
    managersIds: [],
    managers: ['progmgr2@test'],
    description: '**Program2 description**\n* a\n* b\n* c',
  },
  {
    name: 'Program3-not active',
    deletedOn: new Date(),
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
      description: d.description,
      deletedOn: d.deletedOn,
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
