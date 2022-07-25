import React, { ReactNode } from 'react';
import { Box, Text } from 'grommet';
import { ListCol } from '../../../components/list/list-col';
import { TextStriked } from '../../../components/text-striked';
import { UserListFragmentFragment } from '../../../generated/graphql';
import { BaseList } from '../../../components/list/base-list';
import { appPath } from '@teams2/common';
import { fullAddress } from '../../../utils/format-address';
import { formatFullName } from '../../../utils/format-fullname';

type UserListProps = {
  rowCount: number;
  rowGetter: (index: number) => UserListFragmentFragment | null;
  onEmptyList?: () => unknown;
  actionPanel: ReactNode;
  onSelect: (team: UserListFragmentFragment) => unknown;
};

interface UserListRowProps {
  data: UserListFragmentFragment;
}

function UserListRow(props: UserListRowProps) {
  const { data } = props;
  return (
    <>
      <ListCol linkPath={appPath.profile(data.id)}>
        <TextStriked striked={!!data.deletedOn}>{data.username}</TextStriked>
      </ListCol>
      <ListCol>
        <Text>{formatFullName(data.firstName, data.lastName) ?? '-'}</Text>
      </ListCol>
      <ListCol>
        <Text>{data.phone ?? '-'}</Text>
      </ListCol>
    </>
  );
}

export function UserList(props: UserListProps) {
  const { rowCount, rowGetter, actionPanel, onSelect } = props;

  return (
    <BaseList
      actionPanel={actionPanel}
      renderRow={(data) => <UserListRow data={data} />}
      cols="1fr 1fr 1fr"
      rowCount={rowCount}
      rowGetter={rowGetter}
      rowHeight={50}
      columnGap="medium"
      onRowSelect={(user) => onSelect && onSelect(user)}
    />
  );
}
