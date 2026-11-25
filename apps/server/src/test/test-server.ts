import { inject } from 'vitest';
import { Server } from 'node:http';
import { AddressInfo } from 'node:net';
import mongoose from 'mongoose';
import { DocumentNode, print } from 'graphql';
import { connectMongoDB } from '../app/db';
import { createApp } from '../app/create-app';
import { seedTestData, SeededTestData } from '../app/db/test-seed';

export interface TestServer {
  /** URL servera, napr. http://127.0.0.1:12345 */
  url: string;
  /** dáta vytvorené test seedom (ID, prihlasovacie údaje) */
  data: SeededTestData;
  /** prihlásenie cez REST `POST /auth`, vráti JWT */
  loginAs: (username: string, password: string) => Promise<string>;
  /** GraphQL požiadavka s dokumentom z klienta (`apps/client/graphql`) */
  gql: <TData = Record<string, unknown>>(
    doc: DocumentNode,
    variables?: Record<string, unknown>,
    token?: string,
  ) => Promise<GqlResponse<TData>>;
  stop: () => Promise<void>;
}

export interface GqlResponse<TData> {
  status: number;
  data?: TData;
  errors?: { message: string; extensions?: { code?: string } }[];
}

let dbCounter = 0;

/**
 * Spustí server nad vlastnou (prázdnou) databázou v MongoDB v pamäti,
 * naplní ju test seedom a spustí HTTP server na náhodnom porte.
 */
export async function startTestServer(): Promise<TestServer> {
  const dbName = `it_${process.pid}_${Date.now()}_${dbCounter++}`;
  const uri = new URL(inject('mongoUri'));
  uri.pathname = `/${dbName}`;
  await connectMongoDB(uri.toString());

  const data = await seedTestData();

  const app = await createApp({ logRequests: false });
  const server: Server = await new Promise((resolve) => {
    const s = app.listen(0, '127.0.0.1', () => resolve(s));
  });
  const url = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;

  const loginAs = async (username: string, password: string) => {
    const res = await fetch(`${url}/auth`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    const body = await res.json();
    if (!body.token) {
      throw new Error(`Prihlásenie ${username} zlyhalo: ${res.status} ${JSON.stringify(body)}`);
    }
    return body.token as string;
  };

  const gql = async <TData>(
    doc: DocumentNode,
    variables: Record<string, unknown> = {},
    token?: string,
  ): Promise<GqlResponse<TData>> => {
    const res = await fetch(`${url}/graphql`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        ...(token ? { authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ query: print(doc), variables }),
    });
    const text = await res.text();
    let body: Omit<GqlResponse<TData>, 'status'> = {};
    try {
      body = JSON.parse(text);
    } catch {
      body = { errors: [{ message: text }] };
    }
    return { status: res.status, ...body };
  };

  const stop = async () => {
    await new Promise((resolve) => server.close(resolve));
    await mongoose.connection.dropDatabase();
    await mongoose.disconnect();
  };

  return { url, data, loginAs, gql, stop };
}
