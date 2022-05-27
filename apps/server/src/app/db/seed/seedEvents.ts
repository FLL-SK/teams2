import {
  EventData,
  eventRepository,
  TeamData,
  teamRepository,
  UserData,
  userRepository,
} from '../../models';
import { logger } from '@teams2/logger';

type SeedData = EventData & { managers?: string[]; teams?: string[] };

export const seedEventData: SeedData[] = [
  {
    name: 'Event1',
    teamsIds: [],
    managersIds: [],
    teams: ['Team1'],
    managers: ['eventmgr1@test', 'eventmgr2@test'],
  },
  {
    name: 'Event2',
    teamsIds: [],
    managersIds: [],
    teams: ['Team2', 'Team3'],
    managers: ['eventmgr2@test'],
  },
];

const log = logger('seed:Events');

export async function seedEvents() {
  for (const d of seedEventData) {
    const e: EventData = {
      name: d.name,
      teamsIds: d.teamsIds,
      managersIds: d.managersIds,
    };

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
