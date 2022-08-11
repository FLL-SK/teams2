import {
  AddressData,
  NoteData,
  noteRepository,
  TeamData,
  teamRepository,
  userRepository,
} from '../../models';
import { logger } from '@teams2/logger';
import { addDays } from 'date-fns';

type TestSeedData = Omit<TeamData, 'tagIds'> & {
  coaches?: string[];
  notes?: { user: string; createdOffset: number; text: string }[];
};

const createAddres = (prefix: string, team: string, email: string): AddressData => ({
  name: `${team} ${prefix} name`,
  street: `${team} ${prefix} street`,
  city: `${team} ${prefix} city`,
  zip: `${team} ${prefix} Zip`,
  countryCode: `${team} ${prefix} Country`,
  companyNumber: `${team} ${prefix} Company Number`,
  taxNumber: `${team} ${prefix} Tax Number`,
  vatNumber: `${team} ${prefix} VAT Number`,
  contactName: `${team} ${prefix} Contact Name`,
  email: email,
  phone: `${team} ${prefix} Phone`,
});

export const seedTestTeamsData: TestSeedData[] = [
  {
    name: 'Team1',
    coachesIds: [],
    coaches: ['devtest+coach1@fll.sk'],
    notes: [
      {
        user: 'devtest+admin@fll.sk',
        createdOffset: 0,
        text: 'Note 1 hwe oh wefoi weoioe oi o weoif',
      },
      {
        user: 'devtest+progmgr1@fll.sk',
        createdOffset: -2,
        text: 'Note 2 opw úo w po wepfo powe fpo powe ej w e ',
      },
      {
        user: 'devtest+coach1@fll.sk',
        createdOffset: -3,
        text: 'Note 3 rwefewfgwwwf  werf',
      },
      {
        user: 'devtest+progmgr1@fll.sk',
        createdOffset: -4,
        text: 'Note 4 eregww wwerf qo  izoiez orzoi wqezo ioi qiwz qw šr u',
      },
      {
        user: 'devtest+admin@fll.sk',
        createdOffset: -5,
        text: 'Note 5 ergeg weu pouiew  ep euepu',
      },
    ],
    address: createAddres('ad', 'Team1', 'devtest+team1adr@fll.sk'),
    billTo: createAddres('bt', 'Team1', 'devtest+team1bill@fll.sk'),
    shipTo: createAddres('sh', 'Team1', 'devtest+team1ship@fll.sk'),
  },
  {
    name: 'Team2',
    coachesIds: [],
    coaches: ['devtest+coach2@fll.sk', 'devtest+coach3@fll.sk'],
    address: createAddres('ad', 'Team2', 'devtest+team2adr@fll.sk'),
    billTo: createAddres('bt', 'Team2', 'devtest+team2bill@fll.sk'),
  },
  {
    name: 'Team3',
    coachesIds: [],
    coaches: ['devtest+coach3@fll.sk'],
    address: createAddres('ad', 'Team3', 'devtest+team3adr@fll.sk'),
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
      address: d.address,
      tagIds: [],
    };

    for (const username of d.coaches) {
      const u = await userRepository.findByUsername(username);
      if (u) {
        t.coachesIds.push(u._id);
      }
    }

    const nu = await teamRepository.create(t);

    log.debug(`Team created name=%s id=%s`, nu.name, nu._id);

    if (d.notes) {
      log.debug('Creating notes');
      for (const note of d.notes) {
        const u = await userRepository.findOne({ username: note.user }).exec();
        if (u) {
          const n: NoteData = {
            type: 'team',
            ref: nu._id,
            createdBy: u._id,
            createdOn: addDays(new Date(), note.createdOffset),
            text: note.text,
          };
          try {
            log.debug(`Going to create note %o`, n);
            await noteRepository.create(n);
            log.debug(`Note created =%o`, n);
          } catch (e) {
            console.error(e);
          }
        }
      }
    }
  }

  // generate teams
  const u = await userRepository.findByUsername('devtest+coach3@fll.sk');
  for (let i = 100; i <= 500; i++) {
    const t: TeamData = {
      name: `Team${i}`,
      coachesIds: [u._id],
      tagIds: [],
      address: createAddres('ad', `Team${i}`, `devtest-team${i}@fll.sk`),
    };
    const nu = await teamRepository.create(t);
    log.debug(`Team created name=%s id=%s`, nu.name, nu._id);
  }
}
