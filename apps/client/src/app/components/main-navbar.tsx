import { appPath } from '@teams2/common';
import { Box, Header, Nav, Anchor, Sidebar } from 'grommet';
import { DirectionType } from 'grommet/utils';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { UserFragmentFragment } from '../generated/graphql';
import { Logo } from './logo';
import { useAuthenticate } from './auth/useAuthenticate';
import { useAppUser } from './app-user/use-app-user';

function MainNav({ direction }: { direction: DirectionType }) {
  const { isAuthenticated, user, logout } = useAuthenticate();
  const location = useLocation();
  const navigate = useNavigate();
  const [navLink, setNavLink] = useState<string>();
  const [doLogout, setDoLogout] = useState(false);
  const { user: appUser } = useAppUser();

  useEffect(() => {
    if (navLink) {
      navigate(navLink, { state: { from: location } });
    }
    return () => {
      setNavLink(undefined);
    };
  }, [location, navLink, navigate]);

  useEffect(() => {
    if (doLogout) {
      logout();
      navigate('/');
    }
    return () => setDoLogout(false);
  }, [doLogout, logout, navigate]);

  return (
    <Nav direction={direction} align="center">
      <Logo height="70px" />
      <Anchor onClick={() => setNavLink('/')}>Turnaje</Anchor>
      <Box>
        {isAuthenticated ? (
          <Anchor onClick={() => setNavLink(appPath.profile(user?.id))}>Profil</Anchor>
        ) : (
          <Anchor onClick={() => setNavLink(appPath.login)}>Prihlásiť sa</Anchor>
        )}
      </Box>
      {appUser?.isAdmin && <Anchor onClick={() => setNavLink(appPath.admin)}>Admin</Anchor>}
      {isAuthenticated && <Anchor onClick={() => setDoLogout(true)}>Odhlásiť sa</Anchor>}
    </Nav>
  );
}

interface MainNavbarProps {
  responsiveSize: string;
  userData?: UserFragmentFragment | null;
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
