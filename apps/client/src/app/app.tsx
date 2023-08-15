import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { appConfig } from './app-config';
import { GlobalStyle } from './theme/global-style';
import { AppLayout } from './app-layout';
import { AppUserContextProvider } from './components/app-user/app-user-provider';
import { NotificationProvider } from './components/notifications/notification-provider';
import { AuthContext, AuthContextProvider, AuthedApolloProvider } from '@teams2/auth-react';

const ApolloWrapper = ({ children }: { children?: React.ReactNode }) => {
  const token = React.useContext(AuthContext).token;
  return (
    <AuthedApolloProvider apiUri={`${appConfig.rootApiUrl}/graphql`} apiToken={token}>
      <AppUserContextProvider>
        <GlobalStyle />
        <NotificationProvider>
          <AppLayout />
        </NotificationProvider>
      </AppUserContextProvider>
    </AuthedApolloProvider>
  );
};

export function App() {
  return (
    <AuthContextProvider authApiUrl={`${appConfig.rootApiUrl}/auth`}>
      <BrowserRouter>
        <ApolloWrapper />
      </BrowserRouter>
    </AuthContextProvider>
  );
}

export default App;
