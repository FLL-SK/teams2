import { CheckBox } from 'grommet';
import React from 'react';
import { ClosableSidebar } from '../../../components/sidebar';
import { SidebarPanel } from '../../../components/sidebar-panel';

export interface UserListFilterValues {
  includeInactive?: boolean;
  isAdmin?: boolean;
  isSuperAdmin?: boolean;
}

interface UserListFilterProps {
  show: boolean;
  onClose: () => unknown;
  onChange: (values: UserListFilterValues) => unknown;
  values: UserListFilterValues;
}

export function UserListFilter(props: UserListFilterProps) {
  const { onClose, show, onChange, values } = props;

  return (
    <ClosableSidebar onClose={onClose} show={show} title="Filter">
      <SidebarPanel>
        <CheckBox
          toggle={true}
          label="Ukáž neaktívnych"
          checked={values.includeInactive ?? false}
          onChange={() => onChange({ ...values, includeInactive: !values.includeInactive })}
        />
        <CheckBox
          toggle={true}
          label="Je admin"
          checked={values.isAdmin ?? false}
          onChange={() => onChange({ ...values, isAdmin: !values.isAdmin })}
        />
        <CheckBox
          toggle={true}
          label="Je superadmin"
          checked={values.isSuperAdmin ?? false}
          onChange={() => onChange({ ...values, isSuperAdmin: !values.isSuperAdmin })}
        />
      </SidebarPanel>
    </ClosableSidebar>
  );
}

export default UserListFilter;
