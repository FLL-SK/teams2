import { Page, Route } from '@playwright/test';

export const API_URL = 'http://localhost:5000';

/** token uložený v prehliadači pred načítaním stránky (prihlásený používateľ) */
const STORED_TOKEN = 'e2e-token';
/** token, ktorý server vydá pri overení uloženého tokenu alebo pri prihlásení */
const ISSUED_TOKEN = 'e2e-token-issued';
const VALID_TOKENS = [STORED_TOKEN, ISSUED_TOKEN];

export type GraphqlHandler = (variables: Record<string, unknown>) => unknown;

export interface MockApiOptions {
  /** existujúci používateľ – môže sa prihlásiť (ľubovoľné heslo) */
  user?: { id: string; username: string };
  /** používateľ je už prihlásený (token je uložený v prehliadači), predvolene áno, ak je zadaný `user` */
  loggedIn?: boolean;
  /** odpovede GraphQL podľa názvu operácie (vracajú obsah `data`) */
  graphql?: Record<string, GraphqlHandler>;
}

export interface MockApi {
  /** názvy GraphQL operácií v poradí, v akom ich klient úspešne zavolal */
  operations: string[];
  /** GraphQL požiadavky odmietnuté kvôli chýbajúcemu/neplatnému tokenu */
  unauthorized: string[];
}

/**
 * Mockuje REST auth API a GraphQL API servera.
 * Rovnako ako server, `/graphql` bez platného JWT vráti 401.
 * Neznáme GraphQL operácie vrátia chybu, aby test nečakal na odpoveď.
 */
export async function mockApi(page: Page, options: MockApiOptions = {}): Promise<MockApi> {
  const api: MockApi = { operations: [], unauthorized: [] };
  const { user, graphql = {} } = options;
  const loggedIn = options.loggedIn ?? !!user;

  if (user && loggedIn) {
    await page.addInitScript((token) => window.localStorage.setItem('token', token), STORED_TOKEN);
  }

  await page.route(`${API_URL}/auth**`, (route: Route) => {
    const request = route.request();
    const url = new URL(request.url());

    // prihlásenie menom a heslom
    if (request.method() === 'POST' && url.pathname === '/auth') {
      const { username } = request.postDataJSON() ?? {};
      if (user && username === user.username) {
        return route.fulfill({ json: { token: ISSUED_TOKEN, user } });
      }
      return route.fulfill({ json: { error: { message: 'Nesprávne prihlasovacie údaje' } } });
    }

    // overenie uloženého tokenu pri načítaní aplikácie
    if (request.method() === 'GET' && url.pathname === '/auth') {
      // klient posiela token v hlavičke Authorization (#281), starší klient v ?token=
      const header = request.headers()['authorization'] ?? '';
      const token = header.replace(/^Bearer /, '') || url.searchParams.get('token');
      if (user && token && VALID_TOKENS.includes(token)) {
        return route.fulfill({ json: { token: ISSUED_TOKEN, user } });
      }
      return route.fulfill({ json: { error: { message: 'Neplatný token' } } });
    }

    return route.fulfill({ status: 404 });
  });

  await page.route(`${API_URL}/graphql`, async (route: Route) => {
    const request = route.request();
    if (request.method() !== 'POST') {
      return route.fulfill({ status: 204 });
    }
    const { operationName, variables } = request.postDataJSON();

    const auth = (await request.allHeaders())['authorization'] ?? '';
    const token = auth.replace(/^Bearer /, '');
    if (!VALID_TOKENS.includes(token)) {
      api.unauthorized.push(operationName);
      return route.fulfill({ status: 401, body: 'Unauthorized' });
    }

    api.operations.push(operationName);
    const handler = graphql[operationName];
    if (!handler) {
      return route.fulfill({
        json: { errors: [{ message: `Operácia ${operationName} nie je v teste mockovaná.` }] },
      });
    }
    return route.fulfill({ json: { data: handler(variables ?? {}) } });
  });

  return api;
}
