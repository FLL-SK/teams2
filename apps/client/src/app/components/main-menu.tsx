import React, { useCallback } from 'react';
import { appPath } from '@teams2/common';
import { Box, Nav, Anchor, Sidebar, Text } from 'grommet';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { UserFragmentFragment } from '../generated/graphql';
import { Logo } from './logo';
import { useAuthenticate } from './auth/useAuthenticate';
import { useAppUser } from './app-user/use-app-user';

interface AnchorNavProps {
  path: string;
  title: string;
}

function Menu() {
  const location = useLocation();
  const navigate = useNavigate();

  const { user: appUser } = useAppUser();

  const AnchorNav = useCallback(
    ({ path, title }: AnchorNavProps) => (
      <Anchor onClick={() => navigate(path, { state: { from: location } })}>
        <Text>{title}</Text>
      </Anchor>
    ),
    [navigate, location]
  );

  return (
    <Nav align="center" justify="between" gap="medium">
      <AnchorNav path="/" title="Turnaje" />
      {appUser?.isAdmin && <AnchorNav path={appPath.teams} title="Tímy" />}
      {appUser?.isAdmin && <AnchorNav path={appPath.users} title="Používatelia" />}
      {appUser?.isAdmin && <AnchorNav path={appPath.settings} title="Nastavenia" />}
    </Nav>
  );
}

const Footer = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuthenticate();

  return (
    <Nav gap="medium" align="center">
      {isAuthenticated && (
        <Anchor onClick={() => navigate(appPath.profile(user?.id))}>
          <Text>Môj profil</Text>
        </Anchor>
      )}
      {!isAuthenticated && (
        <Anchor onClick={() => navigate(appPath.login)}>
          <Text>Prihlásiť sa</Text>
        </Anchor>
      )}
      {isAuthenticated && (
        <Anchor onClick={() => logout()}>
          <Text>Odhlásiť sa</Text>
        </Anchor>
      )}
    </Nav>
  );
};

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
      footer={<Footer />}
      overflow="hidden"
    >
      <Menu />
    </Sidebar>
  );
}
