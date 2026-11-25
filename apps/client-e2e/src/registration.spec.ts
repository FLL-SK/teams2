import { expect, test } from '@playwright/test';
import { mockApi } from './support/mock-api';

const REG_ID = '6abe44940f366db7e0149602';
const TEAM_ID = '6abe44940f366db7e0149001';
const USER = { id: '6abe44940f366db7e0149100', username: 'admin@example.com' };

const address = (id: string) => ({
  __typename: 'Address',
  id,
  name: 'Testovací tím',
  street: 'Ulica 1',
  city: 'Bratislava',
  zip: '81101',
  countryCode: 'SK',
  companyNumber: null,
  vatNumber: null,
  taxNumber: null,
  contactName: 'Kontakt',
  phone: '0900000000',
  email: 'kontakt@example.com',
});

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

const registration = {
  __typename: 'Registration',
  id: REG_ID,
  teamId: TEAM_ID,
  teamNo: 'T-042',
  programId: 'program-1',
  eventId: null,
  billTo: address('addr-bill'),
  shipTo: address('addr-ship'),
  createdOn: '2026-09-01T00:00:00.000Z',
  createdBy: USER.id,
  confirmedOn: null,
  confirmedBy: null,
  canceledOn: null,
  canceledBy: null,
  invoiceIssuedOn: null,
  invoiceSentOn: null,
  invoiceNote: null,
  invoiceRef: null,
  paidOn: null,
  shipmentGroup: null,
  shippedOn: null,
  girlCount: 2,
  boyCount: 3,
  coachCount: 1,
  sizeConfirmedOn: null,
  type: 'CLASS_PACK',
  impactedChildrenCount: 0,
  impactedTeamCount: 1,
  setCount: 1,
  foodOrder: null,
  event: null,
  program: {
    __typename: 'Program',
    id: 'program-1',
    name: 'FIRST LEGO League Future Edition 8-16',
    maxTeamSize: 10,
    maxTeams: null,
    startDate: '2026-09-01T00:00:00.000Z',
    endDate: '2027-06-30T00:00:00.000Z',
  },
  team: {
    __typename: 'Team',
    id: TEAM_ID,
    name: 'Testovací tím',
    address: address('addr-team'),
    createdOn: '2026-01-01T00:00:00.000Z',
    deletedOn: null,
    deletedBy: null,
    coachesIds: [],
    shipTo: address('addr-team-ship'),
    useBillTo: false,
    billTo: address('addr-team-bill'),
    tags: [],
    coaches: [],
    registrations: [],
  },
  invoiceItems: [],
};

test('priamy link na registráciu (napr. z e-mailu) zobrazí detail registrácie #269', async ({
  page,
}) => {
  const api = await mockApi(page, {
    user: USER,
    graphql: {
      getUser: () => ({ getUser: adminUser }),
      getRegistration: () => ({ getRegistration: registration }),
      getNotes: () => ({ getNotes: [] }),
      getRegistrationFiles: () => ({ getRegistrationFiles: [] }),
      getRegistrationsCount: () => ({ getRegistrationsCount: 0 }),
    },
  });

  await page.goto(`/registration/${REG_ID}`);

  await expect(page.getByText('Registrácia do programu')).toBeVisible();
  await expect(page.getByText('Testovací tím').first()).toBeVisible();
  await expect(page.getByText('T-042').first()).toBeVisible();
  expect(api.operations).toContain('getRegistration');
});
