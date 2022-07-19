import {
  EventData,
  eventRepository,
  RegistrationData,
  registrationRepository,
  InvoiceItemData,
  invoiceItemRepository,
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
  invoiceItems: InvoiceItemData[];
};

export const seedTestEventData: TestSeedData[] = [
  {
    name: 'Event1',
    managersIds: [],
    teams: ['Team1'],
    managers: ['eventmgr1@test', 'eventmgr2@test'],
    program: 'Program1',
    dateOffset: 10,
    invoiceItems: [],
    conditions: '*Event1 Program1 conditions*\n1. condition 1\n2. condtion 2\n3. condition 3',
  },
  {
    name: 'Event2',
    managersIds: [],
    teams: ['Team2', 'Team3'],
    managers: ['eventmgr2@test'],
    program: 'Program1',
    dateOffset: -2,
    invoiceItems: [],
  },
  {
    name: 'Event3',
    managersIds: [],
    teams: ['Team3'],
    managers: ['progmgr1@test'],
    program: 'Program1',
    invoiceItems: [{ lineNo: 1, text: 'Item99', unitPrice: 99, quantity: 1 }],
  },
];

const log = logger('testseed:Events');

export async function seedTestEvents() {
  const adminUser = await userRepository.findOne({ email: 'admin@test' }).exec();
  for (const d of seedTestEventData) {
    const p = await programRepository.findOne({ name: d.program }).lean().exec();
    if (!p) {
      throw new Error(`Program ${d.program} not found`);
    }

    const dt = d.dateOffset ? addDays(new Date(), d.dateOffset) : undefined;

    const e: EventData = {
      name: d.name,
      managersIds: d.managersIds,
      programId: p._id,
      conditions: d.conditions,
    };

    const nu = new eventRepository(e);

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
      const et: RegistrationData = {
        programId: p._id,
        eventId: nu._id,
        teamId: t._id,
        registeredOn: new Date(),
        registeredBy: t.coachesIds.length > 0 ? t.coachesIds[0] : adminUser._id,
      };
      await registrationRepository.create(et);
    }

    await nu.save();

    // create invoice items for an event
    for (const ii of d.invoiceItems) {
      const invi = new invoiceItemRepository(ii);
      invi.eventId = nu._id;
      await invi.save();
    }

    log.debug(`Event created name=%s id=%s`, nu.name, nu._id);
  }
}
