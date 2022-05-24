import styled from 'styled-components';

import { Route, Routes, Link, BrowserRouter } from 'react-router-dom';
import { AuthWrapper } from './components/auth/auth-wrapper';
import { RequireAuth } from './components/auth/require-auth';
import { LoginPage } from './pages/login/login-page';
import { ProfilePage } from './pages/profile/profile-page';
import { AuthedApolloProvider } from './components/auth/authed-apollo-provider';
import { appConfig } from './app-config';
import { AuthContextProvider } from './components/auth/auth-provider';

const StyledApp = styled.div`
  // Your style here
`;

export function App() {
  return (
    <BrowserRouter>
      <AuthContextProvider authApiUrl={`${appConfig.rootApiUrl}/auth`}>
        <AuthWrapper>
          <AuthedApolloProvider>
            <StyledApp>
              <Routes>
                <Route
                  path="/"
                  element={
                    <div>
                      This is the root route.{' '}
                      <Link to="/profile">Click here for protected profile.</Link>
                    </div>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <RequireAuth>
                      <ProfilePage />
                    </RequireAuth>
                  }
                />
                <Route path="/login" element={<LoginPage />} />
              </Routes>
              {/* END: routes */}
            </StyledApp>
          </AuthedApolloProvider>
        </AuthWrapper>
      </AuthContextProvider>
    </BrowserRouter>
  );
}

export default App;
