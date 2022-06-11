import { Select, Spinner } from 'grommet';
import { useState } from 'react';
import { useGetUsersQuery } from '../generated/graphql';

interface UserOption {
  id: string;
  username: string;
  name: string;
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
  const { data, loading, error, refetch } = useGetUsersQuery({
    variables: { filter: { isActive: true } },
    onCompleted: (data) => setOptions(data.getUsers),
  });

  const users = data?.getUsers ?? [];

  return loading ? (
    <Spinner />
  ) : (
    <Select
      options={options}
      labelKey={(u) => `(${u.username}) ${u.name}`}
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
