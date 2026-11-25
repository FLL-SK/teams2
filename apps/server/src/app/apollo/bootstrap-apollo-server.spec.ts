import express from 'express';
import { AddressInfo } from 'node:net';
import { Server } from 'node:http';
import { bootstrapApolloServer } from './bootstrap-apollo-server';

// schéma vygenerovaná cez `pnpm generate` (gql:schema)
const { schemaPath } = vi.hoisted(() => ({
  schemaPath: new URL('../../../../../dist/schema.graphql', import.meta.url).pathname,
}));

vi.mock('../../server-config', async (importOriginal) => {
  const original = await importOriginal<typeof import('../../server-config')>();
  return {
    getServerConfig: () => ({ ...original.getServerConfig(), graphQLSchemaPath: schemaPath }),
  };
});

// kontext bez DB – testujeme iba zostavenie schémy a integráciu Apollo + Express 5
vi.mock('./init-apollo-context', () => ({
  initApolloContext: async () => ({}),
}));

describe('bootstrapApolloServer', () => {
  let server: Server;
  let url: string;

  beforeAll(async () => {
    const app = express();
    app.use(express.json());
    app.use('/graphql', await bootstrapApolloServer(app));
    server = app.listen(0);
    await new Promise((resolve) => server.once('listening', resolve));
    url = `http://127.0.0.1:${(server.address() as AddressInfo).port}/graphql`;
  });

  afterAll(async () => {
    await new Promise((resolve) => server.close(resolve));
  });

  const post = (query: string) =>
    fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ query }),
    });

  it('zostaví schému s resolvermi a odpovie na introspekciu', async () => {
    const res = await post('{ __schema { queryType { name } mutationType { name } } }');
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data.__schema).toEqual({
      queryType: { name: 'Query' },
      mutationType: { name: 'Mutation' },
    });
  });

  it('obsahuje vlastné skaláry zo schémy', async () => {
    const res = await post('{ __type(name: "DateTime") { kind } }');
    const body = await res.json();
    expect(body.data.__type).toEqual({ kind: 'SCALAR' });
  });

  it('neplatný dotaz vráti chybu validácie', async () => {
    const res = await post('{ neexistujucePole }');
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.errors[0].extensions.code).toBe('GRAPHQL_VALIDATION_FAILED');
  });
});
