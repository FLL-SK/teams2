import { Page, Route } from '@playwright/test';

export const API_URL = 'http://localhost:5000';

export type GraphqlHandler = (variables: Record<string, unknown>) => unknown;

export interface MockApiOptions {
  /** prihlásený používateľ – ak nie je zadaný, používateľ nie je prihlásený */
  user?: { id: string; username: string };
  /** odpovede GraphQL podľa názvu operácie (vracajú obsah `data`) */
  graphql?: Record<string, GraphqlHandler>;
}

export interface MockApi {
  /** názvy GraphQL operácií v poradí, v akom ich klient zavolal */
  operations: string[];
}

/**
 * Mockuje REST auth API a GraphQL API servera.
 * Neznáme GraphQL operácie vrátia chybu, aby test nečakal na odpoveď.
 */
export async function mockApi(page: Page, options: MockApiOptions = {}): Promise<MockApi> {
  const api: MockApi = { operations: [] };
  const { user, graphql = {} } = options;

  if (user) {
    await page.addInitScript(() => window.localStorage.setItem('token', 'e2e-token'));
  }

  await page.route(`${API_URL}/auth**`, (route: Route) =>
    route.fulfill({
      json: user ? { token: 'e2e-token-refreshed', user } : { error: { message: 'Not logged in' } },
    }),
  );

  await page.route(`${API_URL}/graphql`, async (route: Route) => {
    if (route.request().method() !== 'POST') {
      return route.fulfill({ status: 204 });
    }
    const { operationName, variables } = route.request().postDataJSON();
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
