import React, { useEffect, useMemo, useState } from 'react';
import { Box, Button, Text, TextInput } from 'grommet';
import { TeamListFragmentFragment, UserListFragmentFragment } from '../../generated/graphql';
import { ListRow } from '../../components/list-row';
import { useNavigate } from 'react-router-dom';
import { appPath } from '@teams2/common';
import { Close } from 'grommet-icons';

interface UserListProps {
  users: UserListFragmentFragment[];
}

const maxItems = 5;

export function UserList(props: UserListProps) {
  const { users } = props;
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState('');
  const [searchResults, setSearchResults] = useState<UserListFragmentFragment[]>([]);

  const searchList = useMemo(
    () =>
      users.map((t) => ({
        text: `${t.name.toLocaleLowerCase()} ${t.username.toLocaleLowerCase()} ${t.phone}`,
        value: t,
      })),
    [users]
  );

  useEffect(() => {
    const results = [];
    for (const item of searchList) {
      if (item.text.includes(searchText.toLocaleLowerCase())) {
        results.push(item.value);
        if (results.length >= maxItems) {
          break;
        }
      }
    }
    setSearchResults(results);
  }, [searchList, searchText]);

  return (
    <Box gap="xsmall">
      <Box direction="row">
        <TextInput
          placeholder="Hľadať meno/email/telefón"
          onChange={({ target }) => setSearchText(target.value)}
        />
        <Button icon={<Close />} onClick={() => setSearchText('')} />
      </Box>
      {searchResults.map((item) => (
        <ListRow
          key={item.id}
          columns="1fr 1fr 1fr"
          pad={{ vertical: 'small', horizontal: 'small' }}
          onClick={() => navigate(appPath.team(item.id))}
        >
          <Text>{item.username}</Text>
          <Text>{item.name}</Text>
          <Text>{item.phone}</Text>
        </ListRow>
      ))}
      <Box pad="small">
        <Text color="light-6">{`Zobrazených je max. ${maxItems} výsledkov`}</Text>
      </Box>
    </Box>
  );
}
