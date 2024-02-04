import React, { ReactNode } from 'react';
import { Box, CheckBox, Text, Tip } from 'grommet';
import { Checkmark, Cube, Cubes, Deliver, Document, Group, Halt, Icon, Money } from 'grommet-icons';
import { ListCol } from '../../../components/list/list-col';
import { TextStriked } from '../../../components/text-striked';
import { RegistrationListFragmentFragment } from '../../../generated/graphql';
import { BaseList } from '../../../components/list/base-list';
import { appPath } from '@teams2/common';
import { fullAddress } from '../../../utils/format-address';
import styled from 'styled-components';
import { formatDate } from '@teams2/dateutils';
import { Index } from 'react-virtualized';
import { formatTeamSize } from '../../../utils/format-teamsize';
import { TagPill } from '../../../components/tag-pill';

interface SelectTeamsProps {
  show: boolean;
  teams: string[];
  onSelect: (teamId: string) => unknown;
}

type RegistrationListProps = {
  rowCount: number;
  rowGetter: (index: number) => RegistrationListFragmentFragment | null;
  onEmptyList?: () => unknown;
  actionPanel: ReactNode;
  onClick: (team: RegistrationListFragmentFragment) => unknown;
  selectTeams?: SelectTeamsProps;
};

interface RegistrationListRowProps {
  data: RegistrationListFragmentFragment;
  selectTeams?: SelectTeamsProps;
}

const colorOK = 'limegreen';
const colorNotOK = 'light-4';

function StatusIcon(props: {
  date?: string | null;
  prefix: string;
  textOK: string;
  textNotOK: string;
  SIcon: Icon;
}) {
  const { date, prefix, textOK, textNotOK, SIcon } = props;
  return (
    <ListCol>
      <Text alignSelf="center">
        <Tip content={`${prefix} ${date ? `${textOK} ${formatDate(date)}` : textNotOK}`}>
          <SIcon color={date ? colorOK : colorNotOK}></SIcon>
        </Tip>
      </Text>
    </ListCol>
  );
}

function RegistrationListRow(props: RegistrationListRowProps) {
  const { data, selectTeams } = props;
  const teamColor =
    data.program.maxTeamSize && data.girlCount + data.boyCount > data.program.maxTeamSize
      ? 'status-critical'
      : undefined;

  const checked = selectTeams?.teams.includes(data.team.id);
  return (
    <>
      {selectTeams && selectTeams.show && (
        <CheckBox
          checked={checked}
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            selectTeams?.onSelect(data.team.id);
          }}
        />
      )}
      <ListCol linkPath={appPath.registration(data.id)}>
        <TextStriked striked={!!data.team.deletedOn || !!data.canceledOn}>
          {data.team.name}
        </TextStriked>
        <Text size="small" color="dark-5" truncate="tip">
          {fullAddress(data.team.address)}
        </Text>
        <Box direction="row">
          {data.team.tags.map((tag) => (
            <TagPill key={tag.id} tag={tag} size="small" />
          ))}
        </Box>
      </ListCol>

      <StatusIcon date={data.createdOn} prefix="Registrovaný" textOK="" textNotOK="" SIcon={Halt} />

      <StatusIcon
        date={data.invoiceIssuedOn}
        prefix="Faktúra"
        textOK="vystavená"
        textNotOK="nevystavená"
        SIcon={Document}
      />
      <StatusIcon
        date={data.paidOn}
        prefix="Faktúra"
        textOK="zaplatená"
        textNotOK="nezaplatená"
        SIcon={Money}
      />

      <StatusIcon
        date={data.confirmedOn}
        prefix="Registrácia"
        textOK="potvrdená"
        textNotOK="nepotvrdená"
        SIcon={Checkmark}
      />

      <ListCol>
        <Text alignSelf="center">{data.shipmentGroup ?? '-'}</Text>
      </ListCol>

      <StatusIcon
        date={data.shippedOn}
        prefix="Zásielka"
        textOK="odoslaná"
        textNotOK="neodoslaná"
        SIcon={Deliver}
      />

      <ListCol>
        <Text alignSelf="center" color={teamColor}>
          {formatTeamSize(data)}
        </Text>
      </ListCol>

      <StatusIcon
        date={data.sizeConfirmedOn}
        prefix="Veľkosť tímu"
        textOK="potvrdená"
        textNotOK="nepotvrdená"
        SIcon={Group}
      />

      <ListCol gap="xs">
        <Tip content={`počet setov`}>
          <Box direction="row" gap="xsmall">
            {data.type === 'NORMAL' ? <Cube /> : <Cubes />}
            <Text alignSelf="center">{data.setCount ?? 0}</Text>
          </Box>
        </Tip>
      </ListCol>

      <ListCol>
        <Text color="dark-5" truncate="tip">
          {data.event.name}
        </Text>
      </ListCol>
    </>
  );
}

const ListWrapper = styled(Box)`
  overflow-x: clip;
  overflow-y: hidden;
  min-height: 100%;
`;

export function RegistrationList(props: RegistrationListProps) {
  const { rowCount, rowGetter, actionPanel, onClick, selectTeams } = props;

  const getHeight = ({ index }: Index) =>
    (rowGetter(index)?.team?.tags.length ?? 0) > 0 ? 100 : 50;

  let cols = '350px 30px 30px 30px 30px 80px 30px 50px 30px 50px auto';
  if (selectTeams?.show) {
    cols = '30px ' + cols;
  }

  return (
    <ListWrapper>
      <BaseList
        actionPanel={actionPanel}
        renderRow={(data) => <RegistrationListRow data={data} selectTeams={selectTeams} />}
        cols={cols}
        rowCount={rowCount}
        rowGetter={rowGetter}
        rowHeight={getHeight}
        columnGap="medium"
        onRowSelect={(team) => onClick && onClick(team)}
      />
    </ListWrapper>
  );
}
