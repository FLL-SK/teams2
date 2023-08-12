import React, { createContext, useCallback, useEffect } from 'react';

interface AuthUser {
  username: string;
  id?: string;
}

interface AuthResponse {
  token?: string;
  user?: AuthUser;
  error?: Error;
}

export interface AuthState {
  isAuthenticated?: boolean;
  isLoggingIn?: boolean;
  user?: AuthUser;
  error?: Error;
}

export interface AuthContextData extends AuthState {
  isInitializing: boolean;
  signup: (username: string, password: string) => Promise<AuthResponse>;
  login: (username: string, password: string) => Promise<AuthResponse>;
  logout: () => void;
  silentCheck: () => Promise<AuthResponse>;
  forgotPassword: (username: string) => Promise<boolean>;
  resetPassword: (token: string, password: string) => Promise<boolean>;
  token?: string | null;
}

const notInitializedFn = () => Promise.reject(new Error('Not initialized'));

const emptyContext: AuthContextData = {
  isInitializing: false,
  isAuthenticated: false,
  isLoggingIn: false,
  user: undefined,
  error: undefined,
  signup: notInitializedFn,
  login: notInitializedFn,
  logout: () => null,
  silentCheck: notInitializedFn,
  forgotPassword: notInitializedFn,
  resetPassword: notInitializedFn,
  token: null,
};

export const AuthContext = createContext<AuthContextData>(emptyContext);

interface AuthContextProviderProps {
  children?: React.ReactNode;
  authApiUrl: string;
}

const postAuth = async (url: string, body: Record<string, unknown>) =>
  await fetch(url, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

export function AuthContextProvider(props: AuthContextProviderProps) {
  const { authApiUrl, children } = props;
  const [state, setState] = React.useState<AuthState>(emptyContext);
  const [initializing, setInitializing] = React.useState(true);
  const [token, setToken] = React.useState<string | null>(null);

  const storeToken = useCallback(
    (token: string) => {
      setToken(token);
      localStorage.setItem('token', token);
    },
    [setToken],
  );

  const loadToken = useCallback(() => {
    const token = localStorage.getItem('token');
    setToken(token);
    return token;
  }, [setToken]);

  const clearToken = useCallback(() => {
    setToken(null);
    localStorage.removeItem('token');
  }, [setToken]);

  // silently check if stored token is valid ---------------------------------
  const silentCheck = useCallback(async (): Promise<AuthResponse> => {
    if (state.isAuthenticated) {
      return state;
    }
    if (state.error) {
      return { error: state.error };
    }
    const token = loadToken();
    if (!token) {
      return {};
    }
    const url = new URL(authApiUrl);
    const params = { token };
    url.search = new URLSearchParams(params).toString();

    const response = await fetch(url.toString());
    if (!response.ok) {
      return {};
    }

    const authResponse: AuthResponse = await response.json();

    if (authResponse.token) {
      storeToken(authResponse.token);
      setState({ isAuthenticated: true, user: authResponse.user });
      return authResponse;
    }

    clearToken();
    setState({ isAuthenticated: false, error: authResponse.error });
    return {};
  }, [authApiUrl, clearToken, loadToken, state, storeToken]);

  // signup ------------------------------------------------------------------
  const signup = useCallback(
    async (username: string, password: string): Promise<AuthResponse> => {
      const url = new URL(authApiUrl);
      url.pathname += '/signup';

      let error: Error | undefined = undefined;
      let response: Response | null = null;

      try {
        response = await postAuth(url.toString(), { username, password });
      } catch (err) {
        error = err as Error;
      } finally {
        if (response && !response.ok) {
          error = new Error(response.statusText);
        }
      }

      if (error || !response) {
        setState({
          isAuthenticated: false,
          isLoggingIn: false,
          error,
        });
        return {};
      }

      const authResponse: AuthResponse = await response.json();

      if (authResponse.token) {
        storeToken(authResponse.token);
        setState({
          isLoggingIn: false,
          isAuthenticated: true,
          user: authResponse.user,
        });
        return authResponse;
      }

      setState({ isAuthenticated: false, isLoggingIn: false, error: authResponse.error });
      return {};
    },
    [authApiUrl, state, storeToken],
  );

  // perform log-in ------------------------------------------------------------
  const login = useCallback(
    async (username: string, password: string): Promise<AuthResponse> => {
      if (initializing) {
        return {};
      }

      const url = new URL(authApiUrl);

      setState({ isLoggingIn: true, user: undefined, error: undefined });
      clearToken();

      let response: Response | null = null;
      let error: Error | undefined = undefined;

      try {
        response = await postAuth(url.toString(), { username, password });
      } catch (err) {
        error = err as Error;
      } finally {
        if (response && !response.ok) {
          error = new Error(response.statusText);
        }
      }

      if (error || !response) {
        setState({
          isAuthenticated: false,
          isLoggingIn: false,
          error,
        });
        return {};
      }

      const authResponse: AuthResponse = await response.json();

      if (authResponse.token) {
        storeToken(authResponse.token);
        setState({
          isLoggingIn: false,
          isAuthenticated: true,
          user: authResponse.user,
        });
        return authResponse;
      }

      setState({ isAuthenticated: false, isLoggingIn: false, error: authResponse.error });
      return {};
    },
    [authApiUrl, clearToken, initializing, state, storeToken],
  );

  // ---------------------------------------------------------------------------
  const logout = useCallback(() => {
    clearToken();
    setState({ isAuthenticated: false, user: undefined });
  }, [clearToken]);

  //----------------------------------------------------------------------------
  const forgotPassword = useCallback(
    async (username: string) => {
      const url = new URL(authApiUrl);
      url.pathname += '/forgot';
      try {
        const response = await fetch(url.toString(), {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ username }),
        });

        return response.ok;
      } catch (error) {
        return false;
      }
    },
    [authApiUrl],
  );

  //----------------------------------------------------------------------------
  const resetPassword = useCallback(
    async (password: string, token: string) => {
      const url = new URL(authApiUrl);
      url.pathname += '/reset';
      try {
        const response = await postAuth(url.toString(), { password, token });
        return response.ok;
      } catch (error) {
        return false;
      }
    },
    [authApiUrl],
  );

  //----------------------------------------------------------------------------

  useEffect(() => {
    silentCheck()
      .catch(() =>
        setState({
          error: new Error('Authentication failed.'),
          user: undefined,
          isLoggingIn: false,
        }),
      )
      .finally(() => setInitializing(false));
  }, [silentCheck]);

  return (
    <AuthContext.Provider
      value={{
        ...state,
        isInitializing: initializing,
        signup,
        login,
        logout,
        silentCheck,
        forgotPassword,
        resetPassword,
        token,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
