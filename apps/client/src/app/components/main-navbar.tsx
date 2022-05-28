import { appPath } from '@teams2/common';
import { Box, Header, Nav, Anchor, Sidebar, Text, Button } from 'grommet';
import { DirectionType } from 'grommet/utils';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuthenticate } from './useAuthenticate';

interface MainNavbarProps {
  responsiveSize: string;
}

function MainNav({ direction }: { direction: DirectionType }) {
  const { isAuthenticated } = useAuthenticate();
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <Nav direction={direction}>
      <Anchor onClick={() => navigate('/')}>Turnaje</Anchor>
      <Box>
        {isAuthenticated ? (
          <Anchor onClick={() => navigate(appPath.profile)}>Profil</Anchor>
        ) : (
          <Anchor onClick={() => navigate(appPath.login, { state: { from: location } })}>
            Prihlásiť sa
          </Anchor>
        )}
      </Box>
    </Nav>
  );
}

export function MainNavbar(props: MainNavbarProps) {
  const { responsiveSize } = props;

  return (
    <Header background={'light-2'} pad="medium">
      {responsiveSize === 'small' ? (
        <Box alignSelf="end">
          <Sidebar>
            <MainNav direction="column" />{' '}
          </Sidebar>
        </Box>
      ) : (
        <MainNav direction="row" />
      )}
    </Header>
  );
}
