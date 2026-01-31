import React, { useEffect } from 'react';
import { Select, Spinner } from 'grommet';
import { useState } from 'react';
import { GetUsersDocument, GetUsersQuery, GetUsersQueryVariables } from '../_generated/graphql';
import { useQuery } from '@apollo/client/react';
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
  const { data, loading } = useQuery<GetUsersQuery, GetUsersQueryVariables>(GetUsersDocument, {
    variables: { filter: { includeInactive: false } },
  });

  const users = data?.getUsers ?? [];

  useEffect(() => {
    setOptions(users);
  }, [users]);

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
