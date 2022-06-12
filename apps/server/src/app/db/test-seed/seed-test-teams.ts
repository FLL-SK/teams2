import { TeamData, teamRepository, userRepository } from '../../models';
import { logger } from '@teams2/logger';

type TestSeedData = TeamData & { coaches?: string[] };

export const seedTestTeamsData: TestSeedData[] = [
  {
    name: 'Team1',
    coachesIds: [],
    coaches: ['coach1@test'],
    billTo: {
      name: 'Bill To',
      street: 'Bill To Street',
      city: 'Bill To City',
      zip: 'Bill To Zip',
      countryCode: 'Bill To Country',
      companyNumber: 'Bill To Company Number',
      vatNumber: 'Bill To VAT Number',
      taxNumber: 'Bill To Tax Number',
      contactName: 'Bill To Contact Name',
      email: 'billTo@test',
      phone: 'Bill To Phone',
    },
    shipTo: {
      name: 'Ship To',
      street: 'Ship To Street',
      city: 'Ship To City',
      zip: 'Ship To Zip',
      countryCode: 'Ship To Country',
      companyNumber: 'Ship To Company Number',
      vatNumber: 'Ship To VAT Number',
      taxNumber: 'Ship To Tax Number',
      contactName: 'Ship To Contact Name',
      email: 'shipTo@test',
      phone: 'Ship To Phone',
    },
  },
  {
    name: 'Team2',
    coachesIds: [],
    coaches: ['coach2@test', 'coach3@test'],
    billTo: {
      name: '2 Bill To',
      street: '2 Bill To Street',
      city: '2 Bill To City',
      zip: '2 Bill To Zip',
      countryCode: '2 Bill To Country',
      companyNumber: '2 Bill To Company Number',
      vatNumber: '2 Bill To VAT Number',
      taxNumber: '2 Bill To Tax Number',
      contactName: '2 Bill To Contact Name',
      email: '2 billTo@test',
      phone: '2 Bill To Phone',
    },
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
      billTo: d.billTo,
      shipTo: d.shipTo,
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
