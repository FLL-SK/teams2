import { appPath } from '@teams2/common';
import { Box, Header, Nav, Anchor, Sidebar, Text, Avatar, Tip, Button } from 'grommet';
import { DirectionType } from 'grommet/utils';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { UserFragmentFragment } from '../generated/graphql';
import { Logo } from './logo';
import { useAuthenticate } from './auth/useAuthenticate';
import { useAppUser } from './app-user/use-app-user';
import { Logout, User } from 'grommet-icons';

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
    <Nav direction={direction} align="center" justify="between" flex>
      <Box direction={direction} gap="medium" align="center">
        <Logo height="70px" />
        <Anchor onClick={() => setNavLink('/')}>
          <Text>Turnaje</Text>
        </Anchor>

        {appUser?.isAdmin && (
          <Anchor onClick={() => setNavLink(appPath.admin)}>
            <Text>Admin</Text>
          </Anchor>
        )}
      </Box>

      <Box direction="row" gap="small" align="center">
        {isAuthenticated ? (
          <Avatar onClick={() => setNavLink(appPath.profile(user?.id))} background="accent-2">
            <Tip content={user?.username}>
              <User />
            </Tip>
          </Avatar>
        ) : (
          <Anchor onClick={() => setNavLink(appPath.login)}>
            <Text>Prihlásiť sa</Text>
          </Anchor>
        )}

        {isAuthenticated && (
          <Button icon={<Logout />} onClick={() => setDoLogout(true)} tip="Odhlásiť sa" />
        )}
      </Box>
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
