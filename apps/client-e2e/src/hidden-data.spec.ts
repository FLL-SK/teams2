import { expect, test } from '@playwright/test';
import { mockApi } from './support/mock-api';

// #289 – server skryje údaje, ktoré používateľ nesmie čítať (registrácia → null,
// cudzí tím → iba názov, organizácia a mesto). Stránky nesmú pri skrytých údajoch spadnúť.

const COACH = { id: '6abe44940f366db7e0149200', username: 'coach@example.com' };
const FOREIGN_TEAM_ID = '6abe44940f366db7e0149009';
const REG_ID = '6abe44940f366db7e0149609';

const coachUser = {
  __typename: 'User',
  id: COACH.id,
  username: COACH.username,
  firstName: 'Tréner',
  lastName: 'Test',
  phone: null,
  deletedOn: null,
  lastLoginOn: null,
  gdprAcceptedOn: '2026-01-01T00:00:00.000Z',
  isAdmin: false,
  isSuperAdmin: false,
  coachingTeams: [],
  managingEvents: [],
  managingPrograms: [],
};

/** cudzí tím tak, ako ho server vráti používateľovi bez práva čítať detaily (TeamMapper.toPublicTeam) */
const publicTeam = {
  __typename: 'Team',
  id: FOREIGN_TEAM_ID,
  name: 'Cudzí tím',
  address: {
    __typename: 'Address',
    id: null,
    name: 'ZŠ Iná',
    street: '',
    city: 'Košice',
    zip: '',
    countryCode: 'SK',
    companyNumber: null,
    vatNumber: null,
    taxNumber: null,
    contactName: null,
    phone: null,
    email: null,
  },
  createdOn: '2026-01-01T00:00:00.000Z',
  deletedOn: null,
  deletedBy: null,
  coachesIds: [],
  shipTo: null,
  useBillTo: null,
  billTo: null,
  tags: [],
  coaches: [],
  registrations: [],
};

const pageErrors: string[] = [];

test.beforeEach(({ page }) => {
  pageErrors.length = 0;
  page.on('pageerror', (e) => pageErrors.push(e.message));
});

test('registrácia, ktorú používateľ nesmie čítať, zobrazí „sa nenašla“', async ({ page }) => {
  await mockApi(page, {
    user: COACH,
    graphql: {
      getUser: () => ({ getUser: coachUser }),
      getRegistration: () => ({ getRegistration: null }),
      getNotes: () => ({ getNotes: [] }),
      getRegistrationFiles: () => ({ getRegistrationFiles: [] }),
    },
  });
  await page.goto(`/registration/${REG_ID}`);
  await expect(page.getByText('Registrácia sa nenašla.')).toBeVisible();
  expect(pageErrors).toEqual([]);
});

test('cudzí tím so skrytými adresami sa zobrazí bez chyby', async ({ page }) => {
  await mockApi(page, {
    user: COACH,
    graphql: {
      getUser: () => ({ getUser: coachUser }),
      getTeam: () => ({ getTeam: publicTeam }),
      getNotes: () => ({ getNotes: [] }),
    },
  });
  await page.goto(`/team/${FOREIGN_TEAM_ID}`);
  await expect(page.getByText('Cudzí tím').first()).toBeVisible();
  await expect(page.getByText('Chyba pri získavaní dát tímu.')).toHaveCount(0);
  expect(pageErrors).toEqual([]);
});
