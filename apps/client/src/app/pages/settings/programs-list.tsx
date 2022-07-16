import React from 'react';
import { Box, Text } from 'grommet';
import { ProgramListFragmentFragment } from '../../generated/graphql';
import { useNavigate } from 'react-router-dom';
import { appPath } from '@teams2/common';
import { ListRow } from '../../components/list-row';
import { formatDate } from '@teams2/dateutils';
import { TextStriked } from '../../components/text-striked';

interface ProgramsListProps {
  programs: ProgramListFragmentFragment[];
}

export function ProgramsList({ programs }: ProgramsListProps) {
  const navigate = useNavigate();
  return (
    <Box gap="small">
      {programs.map((program) => (
        <ListRow
          columns="1fr 120px 120px"
          key={program.id}
          onClick={() => navigate(appPath.program(program.id))}
          hoverIndicator
          pad={{ vertical: 'small', horizontal: 'small' }}
        >
          <TextStriked striked={!!program.deletedOn}>{program.name}</TextStriked>
          <Text>{formatDate(program.startDate)}</Text>
          <Text>{formatDate(program.endDate)}</Text>
        </ListRow>
      ))}
    </Box>
  );
}
