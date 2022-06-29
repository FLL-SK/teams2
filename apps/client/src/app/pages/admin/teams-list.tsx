import React, { useEffect, useMemo, useState } from 'react';
import { Box, Button, Text, TextInput } from 'grommet';
import { TeamListFragmentFragment } from '../../generated/graphql';
import { ListRow } from '../../components/list-row';
import { useNavigate } from 'react-router-dom';
import { appPath } from '@teams2/common';
import { Close } from 'grommet-icons';
import { fullAddress } from '../../utils/format-address';

interface TeamsListProps {
  teams: TeamListFragmentFragment[];
}

const maxItems = 5;

export function TeamsList(props: TeamsListProps) {
  const { teams } = props;
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState('');
  const [searchResults, setSearchResults] = useState<TeamListFragmentFragment[]>([]);

  const searchList = useMemo(
    () =>
      teams.map((t) => ({
        text: `${t.name.toLocaleLowerCase()} ${t.address.city.toLocaleLowerCase()}`,
        value: t,
      })),
    [teams]
  );

  useEffect(() => {
    const results = [];
    for (const item of searchList) {
      if (item.text.includes(searchText.toLocaleLowerCase())) {
        results.push(item.value);
        if (results.length === maxItems) {
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
          placeholder="Hľadať názov tímu/mesto"
          onChange={({ target }) => setSearchText(target.value)}
        />
        <Button icon={<Close />} onClick={() => setSearchText('')} />
      </Box>
      {searchResults.map((team) => (
        <ListRow
          key={team.id}
          columns="1fr"
          pad={{ vertical: 'small', horizontal: 'small' }}
          onClick={() => navigate(appPath.team(team.id))}
        >
          <Text>{team.name}</Text>
          <Text size="small">{fullAddress(team.address)}</Text>
        </ListRow>
      ))}
      <Box pad="small">
        <Text color="light-6">{`Zobrazených je max. ${maxItems} výsledkov`}</Text>
      </Box>
    </Box>
  );
}
