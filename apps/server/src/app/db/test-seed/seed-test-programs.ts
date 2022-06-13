import {
  ProgramData,
  programRepository,
  userRepository,
  ProgramModel,
  InvoiceItemData,
} from '../../models';
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
    invoiceItems: [
      { lineNo: 1, text: 'Item1', unitPrice: 100, quantity: 1 },
      { lineNo: 2, text: 'Item2', unitPrice: 200, quantity: 1 },
    ],
  },
  {
    name: 'Program2',
    managersIds: [],
    managers: ['progmgr2@test'],
    description: '**Program2 description**\n* a\n* b\n* c',

    invoiceItems: [{ lineNo: 1, text: 'Item21', unitPrice: 21, quantity: 1 }],
  },
  {
    name: 'Program3-not active',
    deletedOn: new Date(),
    managersIds: [],
    managers: ['progmgr2@test'],
    invoiceItems: [],
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

    const nu = new programRepository(p);

    for (const ii of d.invoiceItems) {
      nu.invoiceItems.push(ii);
    }

    for (const username of d.managers) {
      const u = await userRepository.findOne({ username });
      if (u) {
        nu.managersIds.push(u._id);
      }
    }

    await nu.save();

    log.debug(`Program created name=%s id=%s`, nu.name, nu._id);
  }
}
