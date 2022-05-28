import { BrowserRouter } from 'react-router-dom';

import { AuthedApolloProvider } from './components/auth/authed-apollo-provider';
import { appConfig } from './app-config';
import { AuthContextProvider } from './components/auth/auth-provider';
import { GlobalStyle } from './theme/global-style';
import { AppLayout } from './app-layout';

export function App() {
  return (
    <AuthContextProvider authApiUrl={`${appConfig.rootApiUrl}/auth`}>
      <BrowserRouter>
        <AuthedApolloProvider>
          <GlobalStyle />
          <AppLayout />
        </AuthedApolloProvider>
      </BrowserRouter>
    </AuthContextProvider>
  );
}

export default App;
