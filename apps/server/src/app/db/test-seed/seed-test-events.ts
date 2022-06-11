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
  },
  {
    name: 'Event2',
    teamsIds: [],
    managersIds: [],
    teams: ['Team2', 'Team3'],
    managers: ['eventmgr2@test'],
    program: 'Program1',
    dateOffset: -2,
  },
  {
    name: 'Event3',
    teamsIds: [],
    managersIds: [],
    teams: ['Team3'],
    managers: ['progmgr1@test'],
    program: 'Program1',
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

    if (dt) {
      e.date = dt;
    }

    for (const username of d.managers) {
      const u = await userRepository.findOne({ username });
      if (u) {
        e.managersIds.push(u._id);
      }
    }

    for (const teamName of d.teams) {
      const t = await teamRepository.findOne({ name: teamName });
      if (t) {
        e.teamsIds.push(t._id);
      }
    }

    const nu = await eventRepository.create(e);

    log.debug(`Event created name=%s id=%s`, nu.name, nu._id);
  }
}
