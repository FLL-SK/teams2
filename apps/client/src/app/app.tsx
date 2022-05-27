import styled from 'styled-components';

import { Route, Routes, Link, BrowserRouter } from 'react-router-dom';
import { AuthWrapper } from './components/auth/auth-wrapper';
import { RequireAuth } from './components/auth/require-auth';
import { LoginPage } from './pages/login/login-page';
import { ProfilePage } from './pages/profile/profile-page';
import { AuthedApolloProvider } from './components/auth/authed-apollo-provider';
import { appConfig } from './app-config';
import { AuthContextProvider } from './components/auth/auth-provider';
import { GlobalStyle } from './theme/global-style';
import { AppLayout } from './app-layout';

export function App() {
  return (
    <BrowserRouter>
      <AuthContextProvider authApiUrl={`${appConfig.rootApiUrl}/auth`}>
        <AuthWrapper>
          <AuthedApolloProvider>
            <GlobalStyle />
            <AppLayout />
          </AuthedApolloProvider>
        </AuthWrapper>
      </AuthContextProvider>
    </BrowserRouter>
  );
}

export default App;
