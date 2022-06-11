import { BrowserRouter } from 'react-router-dom';

import { AuthedApolloProvider } from './components/auth/authed-apollo-provider';
import { appConfig } from './app-config';
import { AuthContextProvider } from './components/auth/auth-provider';
import { GlobalStyle } from './theme/global-style';
import { AppLayout } from './app-layout';
import { AppUserContextProvider } from './components/app-user/app-user-provider';

export function App() {
  return (
    <AuthContextProvider authApiUrl={`${appConfig.rootApiUrl}/auth`}>
      <BrowserRouter>
        <AuthedApolloProvider>
          <AppUserContextProvider>
            <GlobalStyle />
            <AppLayout />
          </AppUserContextProvider>
        </AuthedApolloProvider>
      </BrowserRouter>
    </AuthContextProvider>
  );
}

export default App;
