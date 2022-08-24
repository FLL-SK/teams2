import { appPath } from '@teams2/common';
import { formatDate } from '@teams2/dateutils';
import { Box, Text, Paragraph, Tip } from 'grommet';
import { Deliver, Document, Group, Halt, Money } from 'grommet-icons';
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
          columns="1fr 60px 60px 60px 60px 60px 120px 120px"
          key={program.id}
          onClick={() => navigate(appPath.program(program.id))}
          hoverIndicator
          pad={{ vertical: 'small', horizontal: 'small' }}
        >
          <Box direction="row" gap="small">
            <Box width="20px" background={program.color ?? undefined} />
            <TextStriked striked={!!program.deletedOn}>{program.name}</TextStriked>
          </Box>

          {program.regUnconfirmed ? (
            <Tip content="nepotvrdené">
              <Box direction="row" gap="xsmall">
                <Halt />
                <Text size="small">{program.regUnconfirmed}</Text>
              </Box>
            </Tip>
          ) : (
            <div />
          )}

          {program.regNotInvoiced ? (
            <Tip content="nefakturované">
              <Box direction="row" gap="xsmall">
                <Document />
                <Text size="small">{program.regNotInvoiced}</Text>
              </Box>
            </Tip>
          ) : (
            <div />
          )}

          {program.regUnpaid ? (
            <Tip content="nezaplatené">
              <Box direction="row" gap="xsmall">
                <Money />
                <Text size="small">{program.regUnpaid}</Text>
              </Box>
            </Tip>
          ) : (
            <div />
          )}

          {program.regNotShipped ? (
            <Tip content="neodoslané">
              <Box direction="row" gap="xsmall">
                <Deliver />
                <Text size="small">{program.regNotShipped}</Text>
              </Box>
            </Tip>
          ) : (
            <div />
          )}

          <Tip content="počet registrácií">
            <Box direction="row" gap="xsmall">
              <Group />
              <Text size="small">{program.regCount}</Text>
            </Box>
          </Tip>

          <Box align="end">
            <Text>{formatDate(program.startDate)}</Text>
          </Box>

          <Box align="end">
            <Text>{formatDate(program.endDate)}</Text>
          </Box>
        </ListRow2>
      ))}
    </Box>
  );
}
