import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { ApolloClient, InMemoryCache } from '@apollo/client';
import { ApolloProvider } from '@apollo/client/react';
import { MockLink } from '@apollo/client/testing';
import { PanelRegistrationBilling } from './panel-billing';
import { AppUserContext, AppUserContextData } from '../../../components/app-user/app-user-provider';
import {
  EmailRegistrationInvoiceDocument,
  RegistrationFragmentFragment,
} from '../../../_generated/graphql';

const { notify } = vi.hoisted(() => ({ notify: { error: vi.fn(), info: vi.fn() } }));
vi.mock('../../../components/notifications/notification-provider', () => ({
  useNotification: () => ({ notify }),
}));
vi.mock('../../registrations/components/field-invoiceIssuedOn', () => ({
  FieldInvoiceIssuedOn: () => null,
}));
vi.mock('../../registrations/components/field-paidOn', () => ({ FieldPaidOn: () => null }));

const REG_ID = 'reg-1';

const registration = {
  id: REG_ID,
  billTo: { id: 'a1', name: 'Tím', street: 'Ulica 1', city: 'Bratislava', zip: '81101' },
  invoiceIssuedOn: '2026-11-01T00:00:00.000Z',
  invoiceRef: 'F-1',
  invoiceSentOn: null,
} as unknown as RegistrationFragmentFragment;

const appUser = { isAdmin: () => true } as unknown as AppUserContextData;

const emailMock = (payload: object) => ({
  request: { query: EmailRegistrationInvoiceDocument, variables: { id: REG_ID } },
  result: { data: { emailRegistrationInvoice: { __typename: 'RegistrationPayload', ...payload } } },
});

const renderPanel = (payload: object) =>
  render(
    <ApolloProvider
      client={
        new ApolloClient({ cache: new InMemoryCache(), link: new MockLink([emailMock(payload)]) })
      }
    >
      <AppUserContext.Provider value={appUser}>
        <PanelRegistrationBilling
          registration={registration}
          columnWidth="medium"
          readOnly={false}
          onUpdate={() => undefined}
        />
      </AppUserContext.Provider>
    </ApolloProvider>,
  );

describe('PanelRegistrationBilling – poslanie faktúry (#298)', () => {
  beforeEach(() => vi.clearAllMocks());

  it('pri chybe v payloade zobrazí chybu, nie „Faktúra bola poslaná.“', async () => {
    renderPanel({
      registration: null,
      errors: [
        {
          __typename: 'MutationError',
          code: 'registration_invoice_email_error',
          field: null,
          message: 'SF nedostupná',
        },
      ],
    });
    fireEvent.click(screen.getByText('Poslať faktúru'));

    await waitFor(() =>
      expect(notify.error).toHaveBeenCalledWith(
        'Nepodarilo sa poslať faktúru.',
        'Faktúru sa nepodarilo odoslať e-mailom.',
      ),
    );
    expect(notify.info).not.toHaveBeenCalled();
  });

  it('bez chyby oznámi poslanie faktúry', async () => {
    renderPanel({ registration: null, errors: null });
    fireEvent.click(screen.getByText('Poslať faktúru'));

    await waitFor(() => expect(notify.info).toHaveBeenCalledWith('Faktúra bola poslaná.'));
    expect(notify.error).not.toHaveBeenCalled();
  });
});
