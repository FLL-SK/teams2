import React from 'react';
import { Grommet, Box } from 'grommet';
import styled from 'styled-components';
import { AppRouter } from './app-router';
import { defaultTheme } from './theme';
import { Notifications } from './components/notifications/notifications';

export function AppLayout() {
  return (
    <Grommet theme={defaultTheme}>
      <AppPageWrapper>
        <AppRouter />
        <Notifications />
      </AppPageWrapper>
    </Grommet>
  );
}

const AppPageWrapper = styled(Box)`
  min-height: 100vh;
  min-width: 100%;
`;
