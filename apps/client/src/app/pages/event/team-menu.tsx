import React from 'react';
import { Menu, MenuProps } from 'grommet';
import { Menu as MenuIcon } from 'grommet-icons';
import { TeamListFragmentFragment } from '../../generated/graphql';
import { useNavigate } from 'react-router-dom';
import { appPath } from '@teams2/common';

interface TeamMenuProps {
  team: TeamListFragmentFragment;
  onUnregister: (t: TeamListFragmentFragment) => unknown;
  onChangeEvent: (t: TeamListFragmentFragment) => unknown;
  onClose?: () => unknown;
  canEdit?: boolean;
}

export function TeamMenu(props: TeamMenuProps) {
  const { team, onUnregister, onChangeEvent, onClose, canEdit } = props;
  const navigate = useNavigate();
  const items: MenuProps['items'] = [
    { label: 'Otvor detail tímu', onClick: () => navigate(appPath.team(team.id)) },
  ];

  if (canEdit) {
    items.push(
      { label: 'Presuň na iný turnaj', onClick: () => onChangeEvent(team) },
      { label: 'Odhlás z turnaja', onClick: () => onUnregister(team) }
    );
  }

  return <Menu icon={<MenuIcon />} items={items} onBlur={onClose} />;
}
