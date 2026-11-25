import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router';
import { ApolloClient, InMemoryCache } from '@apollo/client';
import { ApolloProvider } from '@apollo/client/react';
import { MockLink } from '@apollo/client/testing';
import { RegistrationPage } from './registration-page';
import { AppUserContext, AppUserContextData } from '../../components/app-user/app-user-provider';
import { GetNotesDocument, GetRegistrationDocument } from '../../_generated/graphql';

// heavy child components are replaced by simple stubs - the test focuses on data loading
vi.mock('../../components/base-page', () => ({
  BasePage: ({ title, children }: { title?: string; children: React.ReactNode }) => (
    <div>
      <h1>{title}</h1>
      {children}
    </div>
  ),
}));
vi.mock('./components/panel-details', () => ({
  PanelRegistrationDetails: ({ registration }: { registration: { teamNo: string } }) => (
    <div>detail registrácie {registration.teamNo}</div>
  ),
}));
vi.mock('./components/panel-billing', () => ({ PanelRegistrationBilling: () => null }));
vi.mock('./components/panel-shipping', () => ({ PanelRegistrationShipping: () => null }));
vi.mock('./components/panel-invoice-items', () => ({
  PanelRegistrationInvoiceItems: () => null,
}));
vi.mock('./components/registration-files', () => ({ RegistrationFilesPanel: () => null }));
vi.mock('../team/components/coach-list', () => ({ CoachList: () => null }));
vi.mock('../../components/tag-list', () => ({ TagList: () => null }));
vi.mock('../../components/note-list', () => ({ NoteList: () => null }));
vi.mock('../../components/notifications/notification-provider', () => ({
  useNotification: () => ({ notify: { error: vi.fn(), info: vi.fn() } }),
}));

const REG_ID = 'reg-1';
const TEAM_ID = 'team-1';

const address = (id: string) => ({
  __typename: 'Address',
  id,
  name: 'Tím',
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
  createdBy: 'user-1',
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

const regMock = (data: unknown) => ({
  request: { query: GetRegistrationDocument, variables: { id: REG_ID } },
  result: { data: { getRegistration: data } },
  maxUsageCount: Number.POSITIVE_INFINITY,
});

const notesMock = {
  request: { query: GetNotesDocument, variables: { type: 'registration', ref: REG_ID } },
  result: { data: { getNotes: [] } },
  maxUsageCount: Number.POSITIVE_INFINITY,
};

const createClient = (regData: unknown = registration) =>
  new ApolloClient({
    cache: new InMemoryCache(),
    link: new MockLink([regMock(regData), notesMock]),
  });

const appUser = (overrides: Partial<AppUserContextData> = {}): AppUserContextData => ({
  userLoading: false,
  refresh: () => Promise.resolve(),
  isTeamCoach: () => false,
  isEventManager: () => false,
  isProgramManager: () => false,
  isAdmin: () => false,
  isSuperAdmin: () => false,
  isUser: () => false,
  xOut: () => 'xxx',
  ...overrides,
});

const Page = ({ client, user }: { client: ApolloClient; user: AppUserContextData }) => (
  <ApolloProvider client={client}>
    <AppUserContext.Provider value={user}>
      <MemoryRouter initialEntries={[`/registration/${REG_ID}`]}>
        <Routes>
          <Route path="/registration/:id" element={<RegistrationPage />} />
        </Routes>
      </MemoryRouter>
    </AppUserContext.Provider>
  </ApolloProvider>
);

describe('RegistrationPage', () => {
  it('loads and shows the registration for admin', async () => {
    render(<Page client={createClient()} user={appUser({ isAdmin: () => true })} />);

    expect(await screen.findByText('detail registrácie T-042')).toBeTruthy();
    expect(screen.getByText('Registrácia do programu')).toBeTruthy();
  });

  it('loads and shows the registration for team coach', async () => {
    render(
      <Page
        client={createClient()}
        user={appUser({ isTeamCoach: (teamId) => teamId === TEAM_ID })}
      />,
    );

    expect(await screen.findByText('detail registrácie T-042')).toBeTruthy();
  });

  it('shows the registration even when the Apollo client is replaced during loading', async () => {
    // regression #269: after a full page load the Apollo client was re-created while the page
    // was already mounted and the registration query was never executed again
    const user = appUser({ isAdmin: () => true });
    const { rerender } = render(<Page client={createClient()} user={user} />);
    rerender(<Page client={createClient()} user={user} />);

    expect(await screen.findByText('detail registrácie T-042')).toBeTruthy();
  });

  it('shows not authorized page for user who is neither admin nor team coach', async () => {
    render(<Page client={createClient()} user={appUser()} />);

    expect(await screen.findByText('Nemáte oprávnenie k tejto stránke.')).toBeTruthy();
    expect(screen.queryByText('detail registrácie T-042')).toBeNull();
  });

  it('shows not found page when registration does not exist', async () => {
    render(<Page client={createClient(null)} user={appUser({ isAdmin: () => true })} />);

    expect(await screen.findByText('Registrácia sa nenašla.')).toBeTruthy();
  });
});
