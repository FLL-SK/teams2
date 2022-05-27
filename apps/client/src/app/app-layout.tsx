import { Grommet, Box } from 'grommet';
import styled from 'styled-components';
import { AppRouter } from './app-router';
import { defaultTheme, device } from './theme/theme';

export function AppLayout() {
  return (
    <Grommet theme={defaultTheme}>
      <BodyWrapper>
        <AppRouter />
      </BodyWrapper>
    </Grommet>
  );
}

const BodyWrapper = styled(Box)`
  min-height: 100vh;
  max-width: 100%;
  margin: 0 auto;

  @media ${device.laptop} {
    max-width: 1000px;
  }
`;
