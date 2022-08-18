import { appPath } from '@teams2/common';
import { formatDate } from '@teams2/dateutils';
import { Box, Text, Paragraph } from 'grommet';
import React from 'react';
import { useNavigate } from 'react-router';
import { ListRow2 } from '../../../components/list-row';
import { TextStriked } from '../../../components/text-striked';
import { ProgramListFragmentFragment } from '../../../generated/graphql';

interface ProgramsListProps {
  programs: ProgramListFragmentFragment[];
}

export function ProgramsList(props: ProgramsListProps) {
  const { programs } = props;
  const navigate = useNavigate();

  return (
    <Box gap="small">
      {programs.length === 0 && (
        <Box pad="medium">
          <Paragraph>Aktuálne ešte nie sú aktívne žiadne turnaje.</Paragraph>
        </Box>
      )}
      {programs.map((program) => (
        <ListRow2
          columns="1fr 120px 120px"
          key={program.id}
          onClick={() => navigate(appPath.program(program.id))}
          hoverIndicator
          pad={{ vertical: 'small', horizontal: 'small' }}
        >
          <Box direction="row" gap="small">
            <Box width="20px" background={program.color ?? undefined} />
            <TextStriked striked={!!program.deletedOn}>{program.name}</TextStriked>
          </Box>

          <Text>{formatDate(program.startDate)}</Text>
          <Text>{formatDate(program.endDate)}</Text>
        </ListRow2>
      ))}
    </Box>
  );
}
