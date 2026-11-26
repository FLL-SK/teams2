import { render, waitFor } from '@testing-library/react';
import { ApolloClient, CombinedGraphQLErrors, gql } from '@apollo/client';
import { useApolloClient } from '@apollo/client/react';
import { AuthedApolloProvider } from './authed-apollo-provider';

const TEST_QUERY = gql`
  query TestQuery {
    hello
  }
`;

const clients: ApolloClient[] = [];

const ClientSpy = () => {
  const client = useApolloClient();
  clients.push(client);
  return null;
};

const mockFetchResponse = () =>
  ({
    ok: true,
    status: 200,
    headers: new Headers({ 'content-type': 'application/json' }),
    text: async () => JSON.stringify({ data: { hello: 'world' } }),
  }) as unknown as Response;

describe('AuthedApolloProvider', () => {
  let fetchMock: ReturnType<typeof vi.fn>;
  const originalFetch = global.fetch;

  beforeEach(() => {
    clients.length = 0;
    fetchMock = vi.fn(async () => mockFetchResponse());
    global.fetch = fetchMock as unknown as typeof fetch;
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  const renderProvider = (apiToken: string | null) =>
    render(
      <AuthedApolloProvider apiUri="http://localhost/graphql" apiToken={apiToken}>
        <ClientSpy />
      </AuthedApolloProvider>,
    );

  const lastAuthHeader = () => {
    const [, init] = fetchMock.mock.calls[fetchMock.mock.calls.length - 1];
    return (init.headers as Record<string, string>)['authorization'];
  };

  it('keeps the same client instance across re-renders and token changes', () => {
    const { rerender } = renderProvider(null);
    const props = { apiUri: 'http://localhost/graphql' };

    rerender(
      <AuthedApolloProvider {...props} apiToken="token-1">
        <ClientSpy />
      </AuthedApolloProvider>,
    );
    rerender(
      <AuthedApolloProvider {...props} apiToken="token-2">
        <ClientSpy />
      </AuthedApolloProvider>,
    );

    expect(clients.length).toBeGreaterThanOrEqual(3);
    expect(new Set(clients).size).toBe(1);
  });

  it('sends the current token in the Authorization header', async () => {
    const { rerender } = renderProvider('token-1');
    const client = clients[0];

    await client.query({ query: TEST_QUERY, fetchPolicy: 'network-only' });
    expect(lastAuthHeader()).toBe('Bearer token-1');

    rerender(
      <AuthedApolloProvider apiUri="http://localhost/graphql" apiToken="token-2">
        <ClientSpy />
      </AuthedApolloProvider>,
    );

    await client.query({ query: TEST_QUERY, fetchPolicy: 'network-only' });
    expect(lastAuthHeader()).toBe('Bearer token-2');
  });

  it('clears the cache on logout', async () => {
    const { rerender } = renderProvider('token-1');
    const client = clients[0];

    await client.query({ query: TEST_QUERY });
    expect(client.readQuery({ query: TEST_QUERY })).toEqual({ hello: 'world' });

    rerender(
      <AuthedApolloProvider apiUri="http://localhost/graphql" apiToken={null}>
        <ClientSpy />
      </AuthedApolloProvider>,
    );

    await waitFor(() => expect(client.readQuery({ query: TEST_QUERY })).toBeNull());
  });

  it('zamietnutý prístup (FORBIDDEN) vráti slovenskú hlášku (#298)', async () => {
    fetchMock.mockImplementation(
      async () =>
        ({
          ok: true,
          status: 200,
          headers: new Headers({ 'content-type': 'application/json' }),
          text: async () =>
            JSON.stringify({
              data: null,
              errors: [{ message: '(x) Not authorized: Test', extensions: { code: 'FORBIDDEN' } }],
            }),
        }) as unknown as Response,
    );
    renderProvider('token-1');
    const error = await clients[0].query({ query: TEST_QUERY, fetchPolicy: 'network-only' }).then(
      () => undefined,
      (e: unknown) => e,
    );
    expect(CombinedGraphQLErrors.is(error)).toBe(true);
    expect((error as CombinedGraphQLErrors).message).toContain(
      'Nemáte oprávnenie na vykonanie tejto akcie.',
    );
  });
});
