import React from 'react';
import { LabelValue } from '../../../components/label-value';
import { LabelValueGroup } from '../../../components/label-value-group';
import { ClosableSidebar, Sidebar } from '../../../components/sidebar';
import { SidebarPanel, SidebarPanelGroup } from '../../../components/sidebar-panel';
import { TeamListFragmentFragment } from '../../../generated/graphql';

interface UserSidebarProps {
  team?: TeamListFragmentFragment;
  onClose: () => unknown;
}

export function UserSidebar(props: UserSidebarProps) {
  const { team, onClose } = props;
  if (!team) {
    return null;
  }
  return (
    <ClosableSidebar onClose={onClose} show={!!team}>
      <SidebarPanelGroup title="Team">
        <SidebarPanel>
          <LabelValueGroup>
            <LabelValue label="Name" value={team.name} />
          </LabelValueGroup>
        </SidebarPanel>
      </SidebarPanelGroup>
    </ClosableSidebar>
  );
}

export default UserSidebar;
