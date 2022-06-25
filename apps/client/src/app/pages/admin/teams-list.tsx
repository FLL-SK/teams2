import React from 'react';
import { Box, Text } from 'grommet';
import { TeamListFragmentFragment } from '../../generated/graphql';
import { ListRow } from '../../components/list-row';
import { useNavigate } from 'react-router-dom';
import { appPath } from '@teams2/common';

interface TeamsListProps {
  teams: TeamListFragmentFragment[];
}

export function TeamsList({ teams }: TeamsListProps) {
  const navigate = useNavigate();
  return (
    <Box gap="xsmall">
      {teams.map((team) => (
        <ListRow
          key={team.id}
          columns="1fr 1fr 1fr"
          pad={{ vertical: 'small', horizontal: 'small' }}
          onClick={() => navigate(appPath.team(team.id))}
        >
          <Text>{team.name}</Text>
        </ListRow>
      ))}
    </Box>
  );
}
