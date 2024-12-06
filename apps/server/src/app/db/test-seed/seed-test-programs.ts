import {
  InvoiceItemData,
  invoiceItemRepository,
  ProgramData,
  programRepository,
  userRepository,
} from '../../models';
import { logger } from '@teams2/logger';
import { addDays } from 'date-fns';

type TestSeedData = Omit<ProgramData, 'startDate' | 'endDate'> & {
  managers?: string[];
  invoiceItems: InvoiceItemData[];
  startOffset: number;
  endOffset: number;
};

export const seedTestProgramData: TestSeedData[] = [
  {
    name: 'Program1',
    startOffset: -100,
    endOffset: 100,
    managersIds: [],
    managers: ['devtest+progmgr1@fll.sk', 'devtest+progmgr2@fll.sk'],
    description: '**Program1 description**\n* a\n* b\n* c',
    invoiceItems: [
      { lineNo: 1, text: 'Item1', unitPrice: 100, quantity: 1, note: 'Note1' },
      { lineNo: 2, text: 'Item2', unitPrice: 200, quantity: 1 },
    ],
    conditions: '*Program1 conditions*\n1. condition 1\n2. condtion 2\n3. condition 3',
    teamRegSequence: 1,
  },
  {
    name: 'Program2',
    startOffset: -100,
    endOffset: -2,
    managersIds: [],
    managers: ['devtest+progmgr2@fll.sk'],
    description: '**Program2 description**\n* a\n* b\n* c',

    invoiceItems: [{ lineNo: 1, text: 'Item21', unitPrice: 21, quantity: 1 }],
    teamRegSequence: 1,
  },
  {
    name: 'Program3-not active',
    startOffset: -10,
    endOffset: 20,
    deletedOn: new Date(),
    managersIds: [],
    managers: ['devtest+progmgr2@fll.sk'],
    invoiceItems: [],
    teamRegSequence: 1,
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
      conditions: d.conditions,
      startDate: addDays(new Date(), d.startOffset),
      endDate: addDays(new Date(), d.endOffset),
      teamRegSequence: d.teamRegSequence,
    };

    const nu = new programRepository(p);

    for (const username of d.managers) {
      const u = await userRepository.findOne({ username });
      if (u) {
        nu.managersIds.push(u._id);
      }
    }

    await nu.save();

    // create invoice items for a program
    for (const ii of d.invoiceItems) {
      const invi = new invoiceItemRepository(ii);
      invi.programId = nu._id;
      await invi.save();
    }

    log.debug(`Program created name=%s id=%s`, nu.name, nu._id);
  }
}
