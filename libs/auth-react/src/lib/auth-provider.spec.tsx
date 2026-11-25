import { render, waitFor } from '@testing-library/react';
import { AuthContextProvider } from './auth-provider';

describe('AuthContextProvider – obnova tokenu (#281)', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    localStorage.clear();
  });

  it('posiela uložený token v hlavičke Authorization, nie v URL', async () => {
    localStorage.setItem('token', 'ulozeny.jwt.token');
    const fetchMock = vi.fn(async () => ({
      ok: true,
      json: async () => ({ token: 'novy.jwt.token', user: { username: 'a@example.com' } }),
    }));
    vi.stubGlobal('fetch', fetchMock);

    render(
      <AuthContextProvider authApiUrl="http://api.test/auth">
        <div />
      </AuthContextProvider>,
    );

    await waitFor(() => expect(fetchMock).toHaveBeenCalled());
    const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe('http://api.test/auth');
    expect(String(url)).not.toContain('token');
    expect((init.headers as Record<string, string>).Authorization).toBe('Bearer ulozeny.jwt.token');
    await waitFor(() => expect(localStorage.getItem('token')).toBe('novy.jwt.token'));
  });
});
