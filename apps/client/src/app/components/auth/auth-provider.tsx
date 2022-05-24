import React, { createContext, useCallback } from 'react';

interface AuthUser {
  id: string;
  username: string;
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
  login: (username: string, password: string) => Promise<AuthResponse>;
  logout: () => void;
  silentCheck: () => Promise<AuthResponse>;
}

const emptyContext: AuthContextData = {
  isAuthenticated: false,
  isLoggingIn: false,
  user: undefined,
  error: undefined,
  login: () => Promise.reject(new Error('Not initialized')),
  logout: () => null,
  silentCheck: () => Promise.reject(new Error('Not initialized')),
};

export const AuthContext = createContext<AuthContextData>(emptyContext);

interface AuthContextProviderProps {
  children?: React.ReactNode;
  authApiUrl: string;
}

const getToken = () => localStorage.getItem('token');
const setToken = (token: string) => localStorage.setItem('token', token);
const clearToken = () => localStorage.removeItem('token');

export function AuthContextProvider(props: AuthContextProviderProps) {
  const { authApiUrl, children } = props;
  const [state, setState] = React.useState<AuthState>({});

  // silently check if stored token is valid
  const silentCheck = useCallback(async (): Promise<AuthResponse> => {
    if (state.isAuthenticated) {
      return state;
    }
    const token = getToken();
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
      setToken(authResponse.token);
      setState({ isAuthenticated: true, user: authResponse.user });
      return authResponse;
    }

    clearToken();
    setState({ isAuthenticated: false, error: authResponse.error });
    return {};
  }, [authApiUrl, state]);

  // perform log-in
  const login = useCallback(
    async (username: string, password: string): Promise<AuthResponse> => {
      const url = new URL(authApiUrl);

      setState({ isLoggingIn: true, user: undefined, error: undefined });
      clearToken();

      const response = await fetch(url.toString(), {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        setState({
          isAuthenticated: false,
          isLoggingIn: false,
          error: new Error(response.statusText),
        });
        return {};
      }

      const authResponse: AuthResponse = await response.json();

      if (authResponse.token) {
        setToken(authResponse.token);
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
    [authApiUrl]
  );

  const logout = useCallback(() => {
    clearToken();
    setState({ isAuthenticated: false, user: undefined });
  }, [setState]);

  return (
    <AuthContext.Provider value={{ ...state, login, logout, silentCheck }}>
      {children}
    </AuthContext.Provider>
  );
}
