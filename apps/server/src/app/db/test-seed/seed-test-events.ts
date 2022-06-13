import {
  EventData,
  eventRepository,
  programRepository,
  teamRepository,
  userRepository,
} from '../../models';
import { addDays } from 'date-fns';
import { logger } from '@teams2/logger';

type TestSeedData = Omit<EventData, 'programId'> & {
  managers?: string[];
  teams?: string[];
  program: string;
  dateOffset?: number;
};

export const seedTestEventData: TestSeedData[] = [
  {
    name: 'Event1',
    teamsIds: [],
    managersIds: [],
    teams: ['Team1'],
    managers: ['eventmgr1@test', 'eventmgr2@test'],
    program: 'Program1',
    dateOffset: 10,
    invoiceItems: [],
  },
  {
    name: 'Event2',
    teamsIds: [],
    managersIds: [],
    teams: ['Team2', 'Team3'],
    managers: ['eventmgr2@test'],
    program: 'Program1',
    dateOffset: -2,
    invoiceItems: [],
  },
  {
    name: 'Event3',
    teamsIds: [],
    managersIds: [],
    teams: ['Team3'],
    managers: ['progmgr1@test'],
    program: 'Program1',
    invoiceItems: [{ lineNo: 1, text: 'Item99', unitPrice: 99, quantity: 1 }],
  },
];

const log = logger('testseed:Events');

export async function seedTestEvents() {
  for (const d of seedTestEventData) {
    const p = await programRepository.findOne({ name: d.program }).lean().exec();
    if (!p) {
      throw new Error(`Program ${d.program} not found`);
    }

    const dt = d.dateOffset ? addDays(new Date(), d.dateOffset) : undefined;

    const e: EventData = {
      name: d.name,
      teamsIds: d.teamsIds,
      managersIds: d.managersIds,
      programId: p._id,
    };

    const nu = new eventRepository(e);

    for (const ii of d.invoiceItems) {
      nu.invoiceItems.push(ii);
    }

    if (dt) {
      nu.date = dt;
    }

    for (const username of d.managers) {
      const u = await userRepository.findOne({ username });
      if (u) {
        nu.managersIds.push(u._id);
      }
    }

    for (const teamName of d.teams) {
      const t = await teamRepository.findOne({ name: teamName });
      if (t) {
        nu.teamsIds.push(t._id);
      }
    }

    await nu.save();

    log.debug(`Event created name=%s id=%s`, nu.name, nu._id);
  }
}
