import React from 'react';

import { formatDate } from '@teams2/dateutils';
import { Box, Text } from 'grommet';
import { ProgramListFragmentFragment } from '../../../generated/graphql';

interface ProgramTileProps {
  program: ProgramListFragmentFragment;
  selected?: boolean;
  onClick?: (program: ProgramListFragmentFragment) => void;
}

export function ProgramTile(props: ProgramTileProps) {
  const { program, selected, onClick } = props;

  return (
    <Box
      width="400px"
      height="100px"
      key={program.id}
      gap="small"
      pad="small"
      border={selected ? { size: '3px', color: 'brand' } : undefined}
      onClick={onClick ? () => onClick(program) : undefined}
      background="light-3"
    >
      <Text>{program.name}</Text>
      <Box direction="row" gap="medium">
        <Text size="small">{program.startDate ? formatDate(program.startDate) : 'neurčený'}</Text>
        <Text size="small">{program.endDate ? formatDate(program.endDate) : 'neurčený'}</Text>
      </Box>
    </Box>
  );
}
