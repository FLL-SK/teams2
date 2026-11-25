import { expect, test } from '@playwright/test';
import { mockApi } from './support/mock-api';

// Zoznam tímov používa virtualizovaný zoznam (react-virtualized List + react-virtualized-auto-sizer).
// Test overuje, že sa po upgrade (React 19, react-virtualized 10, auto-sizer 2) riadky vykreslia
// a zoznam je stále virtualizovaný (nevykreslia sa všetky riadky naraz).

const USER = { id: '6abe44940f366db7e0149100', username: 'admin@example.com' };
const TEAM_COUNT = 60;

const address = (id: string, city: string) => ({
  __typename: 'Address',
  id,
  name: 'Adresa',
  street: 'Ulica 1',
  city,
  zip: '81101',
  countryCode: 'SK',
  companyNumber: null,
  vatNumber: null,
  taxNumber: null,
});

const team = (i: number) => {
  const no = String(i).padStart(2, '0');
  return {
    __typename: 'Team',
    id: `6abe44940f366db7e01490${no}`,
    name: `Tím ${no}`,
    address: address(`addr-${no}`, `Mesto ${no}`),
    createdOn: '2026-01-01T00:00:00.000Z',
    deletedOn: null,
    deletedBy: null,
    coachesIds: [],
    shipTo: null,
    useBillTo: false,
    billTo: null,
    tags: [],
    coaches: [],
  };
};

const adminUser = {
  __typename: 'User',
  id: USER.id,
  username: USER.username,
  firstName: 'Admin',
  lastName: 'Test',
  phone: null,
  deletedOn: null,
  lastLoginOn: null,
  gdprAcceptedOn: '2026-01-01T00:00:00.000Z',
  isAdmin: true,
  isSuperAdmin: false,
  coachingTeams: [],
  managingEvents: [],
  managingPrograms: [],
};

test('zoznam tímov vykreslí virtualizované riadky', async ({ page }) => {
  const api = await mockApi(page, {
    user: USER,
    graphql: {
      getUser: () => ({ getUser: adminUser }),
      getTeams: () => ({ getTeams: Array.from({ length: TEAM_COUNT }, (_, i) => team(i + 1)) }),
    },
  });

  await page.goto('/teams');

  await expect(page.getByText('Tím 01', { exact: true })).toBeVisible();
  await expect(page.getByText('Mesto 01', { exact: false }).first()).toBeVisible();
  expect(api.operations).toContain('getTeams');

  // virtualizácia – posledný tím nie je v DOM, kým sa k nemu neodroluje
  await expect(page.getByText(`Tím ${TEAM_COUNT}`, { exact: true })).toHaveCount(0);
  await page.locator('.ReactVirtualized__List').evaluate((el) => (el.scrollTop = el.scrollHeight));
  await expect(page.getByText(`Tím ${TEAM_COUNT}`, { exact: true })).toBeVisible();
});
