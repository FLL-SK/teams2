import React from 'react';
import { appPath } from '@teams2/common';
import { Box, Nav, Anchor, Sidebar, Text } from 'grommet';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { UserFragmentFragment } from '../generated/graphql';
import { Logo } from './logo';
import { useAuthenticate } from './auth/useAuthenticate';
import { useAppUser } from './app-user/use-app-user';

function Menu() {
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
    <Nav align="center" justify="between">
      <Box gap="medium" align="center">
        <Box height="30px" />
        <Anchor onClick={() => setNavLink('/')}>
          <Text>Turnaje</Text>
        </Anchor>

        {appUser?.isAdmin && (
          <Anchor onClick={() => setNavLink(appPath.teams)}>
            <Text>Tímy</Text>
          </Anchor>
        )}

        {appUser?.isAdmin && (
          <Anchor onClick={() => setNavLink(appPath.users)}>
            <Text>Používatelia</Text>
          </Anchor>
        )}

        {appUser?.isAdmin && (
          <Anchor onClick={() => setNavLink(appPath.settings)}>
            <Text>Nastavenia</Text>
          </Anchor>
        )}

        {isAuthenticated && (
          <Anchor onClick={() => setNavLink(appPath.profile(user?.id))}>
            <Text>Môj profil</Text>
          </Anchor>
        )}
      </Box>
    </Nav>
  );
}

interface MainMenuProps {
  responsiveSize: string;
  userData?: UserFragmentFragment | null;
}

export function MainMenu(props: MainMenuProps) {
  const { responsiveSize } = props;

  return (
    <Sidebar
      background="brandLighter"
      pad="medium"
      height="100vh"
      header={<Logo width="100%" />}
      overflow="hidden"
    >
      <Menu />
    </Sidebar>
  );
}
