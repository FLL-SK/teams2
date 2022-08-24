import React from 'react';
import { appPath } from '@teams2/common';
import { Nav, Sidebar, Button, Box, Text } from 'grommet';
import { Location, useLocation, useNavigate } from 'react-router-dom';
import { UserFragmentFragment } from '../generated/graphql';
import { Logo } from './logo';
import { useAuthenticate } from './auth/useAuthenticate';
import { useAppUser } from './app-user/use-app-user';
import { getColor } from '../theme';
import styled from 'styled-components';
import { useApolloClient } from '@apollo/client';

interface MenuButtonProps {
  icon?: JSX.Element;
  path?: string;
  title: string;
  from?: Location;
  onClick?: () => void;
  badges?: Badge[];
}

const StyledButton = styled(Button)`
  font-weight: bold;
  color: ${getColor('brand')};
  width: 100%;
`;

interface Badge {
  label: string;
  color: string;
  tip?: string;
}

const MultiBadge = (props: { badges?: Badge[] }) => {
  if (!props.badges || props.badges.length === 0) {
    return null;
  }

  return (
    <Box direction="row" align="center" gap="xxsmall">
      {props.badges.map((badge, idx) => (
        <Box key={idx} pad="xxsmall" background={badge.color} round="small" align="center">
          <Text size="small" color="white" tip={{ content: badge.tip }}>
            {badge.label}
          </Text>
        </Box>
      ))}
    </Box>
  );
};

const MenuButton = ({ path, title, icon, onClick, badges }: MenuButtonProps) => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <StyledButton
      plain
      onClick={() =>
        onClick ? onClick() : path ? navigate(path, { state: { from: location } }) : null
      }
    >
      <Box>
        {icon}
        {title}
        <MultiBadge badges={badges} />
      </Box>
    </StyledButton>
  );
};

interface MenuProps {
  regCount?: { unconfirmed: number; unpaid: number; uninvoiced: number; unshipped: number };
}

function regsToBadges(regCount?: MenuProps['regCount']) {
  if (!regCount) {
    return [];
  }
  const { unconfirmed, unpaid, uninvoiced, unshipped } = regCount;
  const badges: Badge[] = [];
  if (unconfirmed > 0) {
    badges.push({
      label: unconfirmed < 10 ? `${unconfirmed}` : '9+',
      color: 'status-critical',
      tip: 'nepotvrdené',
    });
  }
  if (uninvoiced > 0) {
    badges.push({
      label: uninvoiced < 10 ? `${uninvoiced}` : '9+',
      color: 'magenta',
      tip: 'nefakturované',
    });
  }

  if (unpaid > 0) {
    badges.push({
      label: unpaid < 10 ? `${unpaid}` : '9+',
      color: 'status-warning',
      tip: 'nezaplatené',
    });
  }
  if (unshipped > 0) {
    badges.push({
      label: unshipped < 10 ? `${unshipped}` : '9+',
      color: 'status-ok',
      tip: 'neodoslané',
    });
  }
  return badges;
}

function Menu(props: MenuProps) {
  const { isAuthenticated } = useAuthenticate();
  const { user: appUser } = useAppUser();

  return (
    <Nav align="center" justify="between" gap="medium">
      {!isAuthenticated && <MenuButton path={appPath.login} title={'Prihlásiť sa'} />}
      {appUser?.isAdmin && (
        <MenuButton
          path={appPath.registrations}
          title="Registrácie"
          badges={regsToBadges(props.regCount)}
        />
      )}
      {isAuthenticated && <MenuButton path={appPath.events} title="Turnaje" />}
      {appUser?.isAdmin && <MenuButton path={appPath.programs} title="Programy" />}
      {appUser?.isAdmin && <MenuButton path={appPath.teams} title="Tímy" />}
      {appUser?.isAdmin && <MenuButton path={appPath.users} title="Používatelia" />}
      {appUser?.isAdmin && <MenuButton path={appPath.settings} title="Nastavenia" />}
    </Nav>
  );
}

const Footer = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuthenticate();
  const apolloClient = useApolloClient();

  return (
    <Nav gap="medium" align="center">
      {isAuthenticated && <MenuButton path={appPath.profile(user?.id)} title={'Môj profil'} />}
      {isAuthenticated && (
        <MenuButton
          title={'Odhlásiť sa'}
          onClick={() => {
            navigate('/');
            logout();
            apolloClient.clearStore();
          }}
        />
      )}
    </Nav>
  );
};

interface MainMenuProps {
  responsiveSize: string;
  userData?: UserFragmentFragment | null;
  regCount?: { unconfirmed: number; unpaid: number; uninvoiced: number; unshipped: number };
}

export function MainMenu(props: MainMenuProps) {
  const { responsiveSize, regCount } = props;

  return (
    <Sidebar
      background="brandLighter"
      pad="medium"
      height="100vh"
      header={<Logo width="100%" height="100px" />}
      footer={<Footer />}
      overflow="hidden"
    >
      <Menu regCount={regCount} />
    </Sidebar>
  );
}
