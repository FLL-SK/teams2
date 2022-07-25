import React from 'react';
import { LabelValue } from '../../../components/label-value';
import { LabelValueGroup } from '../../../components/label-value-group';
import { ClosableSidebar } from '../../../components/sidebar';
import { SidebarPanel, SidebarPanelGroup } from '../../../components/sidebar-panel';
import { UserListFragmentFragment } from '../../../generated/graphql';

interface UserSidebarProps {
  user?: UserListFragmentFragment;
  onClose: () => unknown;
}

export function UserSidebar(props: UserSidebarProps) {
  const { user, onClose } = props;
  if (!user) {
    return null;
  }
  return (
    <ClosableSidebar onClose={onClose} show={!!user}>
      <SidebarPanelGroup title="Používateľ">
        <SidebarPanel>
          <LabelValueGroup direction="row" gap="medium">
            <LabelValue label="Meno" value={user.firstName} />
            <LabelValue label="Priezvisko" value={user.lastName} />
            <LabelValue label="email" value={user.username} />
            <LabelValue label="Telefón" value={user.phone} />
          </LabelValueGroup>
        </SidebarPanel>
      </SidebarPanelGroup>
    </ClosableSidebar>
  );
}

export default UserSidebar;
