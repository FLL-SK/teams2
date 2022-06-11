import { TeamData, teamRepository, UserData, userRepository } from '../../models';
import { logger } from '@teams2/logger';

type TestSeedData = TeamData & { coaches?: string[] };

export const seedTestTeamsData: TestSeedData[] = [
  {
    name: 'Team1',
    coachesIds: [],
    coaches: ['coach1@test'],
  },
  {
    name: 'Team2',
    coachesIds: [],
    coaches: ['coach2@test', 'coach3@test'],
  },
  {
    name: 'Team3',
    coachesIds: [],
    coaches: ['coach3@test'],
  },
];

const log = logger('testseed:Teams');

export async function seedTestTeams() {
  for (const d of seedTestTeamsData) {
    const t: TeamData = {
      name: d.name,
      coachesIds: d.coachesIds,
    };

    for (const username of d.coaches) {
      const u = await userRepository.findOne({ username });
      if (u) {
        t.coachesIds.push(u._id);
      }
    }

    const nu = await teamRepository.create(t);

    log.debug(`Team created name=%s id=%s`, nu.name, nu._id);
  }
}
