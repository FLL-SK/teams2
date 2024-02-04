import { appPath } from '@teams2/common';
import { formatDate } from '@teams2/dateutils';
import { Box, Text, Paragraph, Tip } from 'grommet';
import { Cubes, Deliver, Document, Group, Halt, Money } from 'grommet-icons';
import React, { useCallback } from 'react';
import { useNavigate } from 'react-router';
import { ListRow2 } from '../../../components/list-row';
import { TextStriked } from '../../../components/text-striked';
import { ProgramListFragmentFragment } from '../../../generated/graphql';
import { constructRegistrationsSearchParams } from '../../registrations/components/registration-list-params';

interface ProgramsListProps {
  programs: ProgramListFragmentFragment[];
}

export function ProgramsList(props: ProgramsListProps) {
  const { programs } = props;

  return (
    <Box gap="small">
      {programs.length === 0 && (
        <Box pad="medium">
          <Paragraph>Žiadne programy.</Paragraph>
        </Box>
      )}
      {programs.map((program) => (
        <ProgramListRow key={program.id} program={program} />
      ))}
    </Box>
  );
}

function ProgramListRow({ program }: { program: ProgramListFragmentFragment }) {
  const navigate = useNavigate();

  const navigateRegs = useCallback(
    (
      ev: React.MouseEvent<Element, MouseEvent>,
      options?: {
        notConfirmed?: boolean;
        notPaid?: boolean;
        notShipped?: boolean;
        notInvoiced?: boolean;
      },
    ) => {
      const { notConfirmed, notPaid, notShipped, notInvoiced } = options ?? {};
      ev.preventDefault();
      ev.stopPropagation();
      const p = constructRegistrationsSearchParams({
        programId: program.id,
        notPaid,
        notConfirmed,
        notShipped,
        notInvoiced,
      });

      navigate(`${appPath.registrations}?${p.toString()}`);
    },
    [navigate, program.id],
  );

  let maxColor = undefined;
  let notice = undefined;

  if (program.maxTeams && program.regCount >= program.maxTeams) {
    maxColor = 'status-critical';
    notice = 'program je naplnený';
  } else if (program.maxTeams && program.maxTeams - program.regCount < 3) {
    maxColor = 'status-warning';
    notice = 'posledné miesta';
  }

  return (
    <ListRow2
      columns="1fr 60px 60px 60px 60px 80px 60px 120px 120px"
      key={program.id}
      onClick={() => navigate(appPath.program(program.id))}
      hoverIndicator
      pad={{ vertical: 'small', horizontal: 'small' }}
      align="center"
    >
      <Box direction="row" gap="small">
        <Box width="20px" background={program.color ?? undefined} />
        <Box>
          <TextStriked striked={!!program.deletedOn}>{program.name}</TextStriked>
          <Text size="small">{program.group ?? ''}</Text>
        </Box>
      </Box>

      {program.regUnconfirmed ? (
        <Tip content="nepotvrdené">
          <Box
            direction="row"
            gap="xsmall"
            onClick={(e) => navigateRegs(e, { notConfirmed: true })}
          >
            <Halt />
            <Text size="small">{program.regUnconfirmed}</Text>
          </Box>
        </Tip>
      ) : (
        <div />
      )}

      {program.regNotInvoiced ? (
        <Tip content="nefakturované">
          <Box direction="row" gap="xsmall" onClick={(e) => navigateRegs(e, { notInvoiced: true })}>
            <Document />
            <Text size="small">{program.regNotInvoiced}</Text>
          </Box>
        </Tip>
      ) : (
        <div />
      )}

      {program.regUnpaid ? (
        <Tip content="nezaplatené">
          <Box direction="row" gap="xsmall" onClick={(e) => navigateRegs(e, { notPaid: true })}>
            <Money />
            <Text size="small">{program.regUnpaid}</Text>
          </Box>
        </Tip>
      ) : (
        <div />
      )}

      {program.regNotShipped ? (
        <Tip content="neodoslané">
          <Box direction="row" gap="xsmall" onClick={(e) => navigateRegs(e, { notShipped: true })}>
            <Deliver />
            <Text size="small">{program.regNotShipped}</Text>
          </Box>
        </Tip>
      ) : (
        <div />
      )}

      <Tip content={`počet registrácií${notice ? ' / ' + notice : ''}`}>
        <Box direction="row" gap="xsmall" onClick={navigateRegs}>
          <Group />
          <Text size="small" color={maxColor}>
            {program.regCount}/{program.maxTeams ? program.maxTeams : '-'}
          </Text>
        </Box>
      </Tip>

      <Tip content={`počet setov${notice ? ' / ' + notice : ''}`}>
        <Box direction="row" gap="xsmall" onClick={navigateRegs}>
          <Cubes />
          <Text size="small" color={maxColor}>
            {program.regSetCount}
          </Text>
        </Box>
      </Tip>

      <Box align="end">
        <Text>{formatDate(program.startDate)}</Text>
      </Box>

      <Box align="end">
        <Text>{formatDate(program.endDate)}</Text>
      </Box>
    </ListRow2>
  );
}
