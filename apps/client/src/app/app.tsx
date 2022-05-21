import styled from 'styled-components';

import { Route, Routes, Link, BrowserRouter } from 'react-router-dom';
import { Auth0Wrapper } from './components/auth/auth0-wrapper';
import { RequireAuth } from './components/auth/require-auth';
import { LoginPage } from './pages/login/login-page';
import { ProfilePage } from './pages/profile/profile-page';
import { Auth0Provider } from '@auth0/auth0-react';
import { AuthedApolloProvider } from './components/auth/authed-apollo-provider';

const StyledApp = styled.div`
  // Your style here
`;

export function App() {
  return (
    <BrowserRouter>
      <Auth0Provider
        domain="fllsk-dev.eu.auth0.com"
        clientId="KhsK57vIU9x1QcW3ZhUeCKkMxM9ywibC"
        redirectUri={window.location.origin}
        audience="https://fllsk-dev.eu.auth0.com/api/v2/"
        scope="read:current_user"
      >
        <Auth0Wrapper>
          <AuthedApolloProvider>
            <StyledApp>
              <Routes>
                <Route
                  path="/"
                  element={
                    <div>
                      This is the generated root route.{' '}
                      <Link to="/profile">Click here for page 2.</Link>
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
        </Auth0Wrapper>
      </Auth0Provider>
    </BrowserRouter>
  );
}

export default App;
