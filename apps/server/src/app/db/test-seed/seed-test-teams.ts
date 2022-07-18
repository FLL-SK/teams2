import {
  eventRepository,
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

export const seedTestTeamsData: TestSeedData[] = [
  {
    name: 'Team1',
    coachesIds: [],
    coaches: ['coach1@test'],
    notes: [
      {
        user: 'admin@test',
        createdOffset: 0,
        text: 'Note 1',
      },
      {
        user: 'progmgr1@test',
        createdOffset: -2,
        text: 'Note 2',
      },
    ],
    address: {
      name: 'Adr name',
      street: 'Adre street',
      city: 'Adr city',
      zip: 'Adr Zip',
      countryCode: 'Adr Country',
      contactName: 'Adr Contact Name',
      email: 'adr@test',
      phone: 'Adr Phone',
    },

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
    address: {
      name: '2 Adr name',
      street: '2 Adre street',
      city: '2 Adr city',
      zip: '2 Adr Zip',
      countryCode: '2 Adr Country',
      contactName: '2 Adr Contact Name',
      email: '2adr@test',
      phone: '2 Adr Phone',
    },
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
    address: {
      name: '3 Adr name',
      street: '3 Adre street',
      city: '3 Adr city',
      zip: '3 Adr Zip',
      countryCode: '3 Adr Country',
      contactName: '3 Adr Contact Name',
      email: '3adr@test',
      phone: '3 Adr Phone',
    },
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
      address: d.address,
      tagIds: [],
    };

    for (const username of d.coaches) {
      const u = await userRepository.findOne({ username });
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
}
