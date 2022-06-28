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
    <Box gap="small">
      {programs.map((program) => (
        <Box
          key={program.id}
          pad={{ vertical: 'small', horizontal: 'small' }}
          onClick={() => navigate(appPath.program(program.id))}
          hoverIndicator
        >
          <Text>{program.name}</Text>
        </Box>
      ))}
    </Box>
  );
}
