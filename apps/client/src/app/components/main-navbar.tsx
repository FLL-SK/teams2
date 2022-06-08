import { appPath } from '@teams2/common';
import { Box, Header, Nav, Anchor, Sidebar } from 'grommet';
import { DirectionType } from 'grommet/utils';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuthenticate } from './useAuthenticate';

interface MainNavbarProps {
  responsiveSize: string;
}

function MainNav({ direction }: { direction: DirectionType }) {
  const { isAuthenticated, user } = useAuthenticate();
  const location = useLocation();
  const navigate = useNavigate();
  const [navLink, setNavLink] = useState<string>();

  useEffect(() => {
    if (navLink) {
      navigate(navLink, { state: { from: location } });
    }
    return () => {
      setNavLink(undefined);
    };
  }, [location, navLink, navigate]);

  return (
    <Nav direction={direction}>
      <Anchor onClick={() => setNavLink('/')}>Turnaje</Anchor>
      <Box>
        {isAuthenticated ? (
          <Anchor onClick={() => setNavLink(appPath.profile(user?.id))}>Profil</Anchor>
        ) : (
          <Anchor onClick={() => setNavLink(appPath.login)}>Prihlásiť sa</Anchor>
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
