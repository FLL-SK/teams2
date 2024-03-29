import React from 'react';
import { Select, Spinner } from 'grommet';
import { useState } from 'react';
import { useGetUsersQuery } from '../_generated/graphql';
import { formatFullName } from '../utils/format-fullname';

interface UserOption {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
}

interface SelectUserProps {
  selected?: string;
  onSelect: (user: UserOption) => void;
  onClose: () => void;
  clearable?: boolean;
}

export function SelectUser(props: SelectUserProps) {
  const { onSelect, onClose, selected, clearable } = props;
  const [options, setOptions] = useState<UserOption[]>([]);
  const { data, loading } = useGetUsersQuery({
    variables: { filter: { includeInactive: false } },
    onCompleted: (data) => setOptions(data.getUsers),
  });

  const users = data?.getUsers ?? [];

  return loading ? (
    <Spinner />
  ) : (
    <Select
      options={options}
      labelKey={(u) => `(${u.username}) ${formatFullName(u.firstName, u.lastName)}`}
      onChange={({ option }) => {
        onSelect && onSelect(option);
        onClose();
      }}
      onClose={() => {
        setOptions(users);
        onClose();
      }}
      value={options.find((o) => o.id === selected)}
      clear={clearable ? { label: 'Zrušiť výber' } : false}
      onSearch={(text) => setOptions(users.filter((u) => u.username.includes(text)))}
      emptySearchMessage="Nenašli sa žiadni používatelia"
    />
  );
}
