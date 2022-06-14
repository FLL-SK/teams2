import React from 'react';
import { Box, Text } from 'grommet';
import { ProgramListFragmentFragment } from '../../generated/graphql';
import { ListRow } from '../../components/list-row';
import { useNavigate } from 'react-router-dom';
import { appPath } from '@teams2/common';

interface ProgramsListProps {
  programs: ProgramListFragmentFragment[];
}

export function ProgramsList({ programs }: ProgramsListProps) {
  const navigate = useNavigate();
  return (
    <Box gap="xsmall">
      {programs.map((program) => (
        <ListRow
          key={program.id}
          columns="1fr 1fr 1fr"
          pad={{ vertical: 'small', horizontal: 'small' }}
          onClick={() => navigate(appPath.program(program.id))}
        >
          <Text>{program.name}</Text>
        </ListRow>
      ))}
    </Box>
  );
}
