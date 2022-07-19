import React from 'react';
import { appPath } from '@teams2/common';
import { Nav, Sidebar, Button } from 'grommet';
import { Location, useLocation, useNavigate } from 'react-router-dom';
import { UserFragmentFragment } from '../generated/graphql';
import { Logo } from './logo';
import { useAuthenticate } from './auth/useAuthenticate';
import { useAppUser } from './app-user/use-app-user';
import { Group } from 'grommet-icons';
import { getColor } from '../theme';
import styled from 'styled-components';

interface MenuButtonProps {
  icon?: JSX.Element;
  path?: string;
  title: string;
  from?: Location;
  onClick?: () => void;
}

const StyledButton = styled(Button)`
  font-weight: bold;
  color: ${getColor('brand')};
  width: 100%;
`;

const MenuButton = ({ path, title, icon, onClick }: MenuButtonProps) => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <StyledButton
      plain
      label={title}
      icon={icon}
      onClick={() =>
        onClick ? onClick() : path ? navigate(path, { state: { from: location } }) : null
      }
    />
  );
};

function Menu() {
  const { user: appUser } = useAppUser();

  return (
    <Nav align="center" justify="between" gap="medium">
      <MenuButton path="/" title="Turnaje" />
      {appUser?.isAdmin && (
        <MenuButton path={appPath.teams} title="Tímy" icon={<Group color="brand" />} />
      )}
      {appUser?.isAdmin && <MenuButton path={appPath.registrations} title="Registrácie" />}
      {appUser?.isAdmin && <MenuButton path={appPath.users} title="Používatelia" />}
      {appUser?.isAdmin && <MenuButton path={appPath.settings} title="Nastavenia" />}
    </Nav>
  );
}

const Footer = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuthenticate();

  return (
    <Nav gap="medium" align="center">
      {isAuthenticated && <MenuButton path={appPath.profile(user?.id)} title={'Môj profil'} />}
      {!isAuthenticated && <MenuButton path={appPath.login} title={'Prihlásiť sa'} />}
      {isAuthenticated && (
        <MenuButton
          title={'Odhlásiť sa'}
          onClick={() => {
            navigate('/');
            logout();
          }}
        />
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
