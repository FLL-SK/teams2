import React, { ReactNode } from 'react';
import { Box, Text, Tip } from 'grommet';
import { Deliver, Document, Group, Halt, Money } from 'grommet-icons';
import { ListCol } from '../../../components/list/list-col';
import { TextStriked } from '../../../components/text-striked';
import { RegistrationListFragmentFragment } from '../../../generated/graphql';
import { BaseList } from '../../../components/list/base-list';
import { appPath } from '@teams2/common';
import { fullAddress } from '../../../utils/format-address';
import styled from 'styled-components';
import { Tag } from '../../../components/tag';
import { formatDate } from '@teams2/dateutils';
import { Index } from 'react-virtualized';
import { formatTeamSize } from '../../../utils/format-teamsize';

type RegistrationListProps = {
  rowCount: number;
  rowGetter: (index: number) => RegistrationListFragmentFragment | null;
  onEmptyList?: () => unknown;
  actionPanel: ReactNode;
  onSelect: (team: RegistrationListFragmentFragment) => unknown;
};

interface RegistrationListRowProps {
  data: RegistrationListFragmentFragment;
}

function RegistrationListRow(props: RegistrationListRowProps) {
  const { data } = props;
  return (
    <>
      <ListCol linkPath={appPath.registration(data.id)}>
        <TextStriked striked={!!data.team.deletedOn}>{data.team.name}</TextStriked>
        <Text size="small" color="dark-5" truncate="tip">
          {fullAddress(data.team.address)}
        </Text>
        <Box direction="row">
          {data.team.tags.map((tag) => (
            <Tag key={tag.id} value={tag.label} size="small" />
          ))}
        </Box>
      </ListCol>

      <ListCol>
        <Text alignSelf="center">
          <Tip content={`Registrovaný ${formatDate(data.registeredOn)}`}>
            <Halt />
          </Tip>
        </Text>
      </ListCol>

      <ListCol>
        <Text alignSelf="center">
          {data.invoiceIssuedOn ? (
            <Tip content={`Faktúra vystavená ${formatDate(data.invoiceIssuedOn)}`}>
              <Document />
            </Tip>
          ) : (
            '-'
          )}
        </Text>
      </ListCol>

      <ListCol>
        <Text alignSelf="center">
          {data.paidOn ? (
            <Tip content={`Faktúra zaplatená ${formatDate(data.paidOn)}`}>
              <Money />
            </Tip>
          ) : (
            '-'
          )}
        </Text>
      </ListCol>

      <ListCol>
        <Text alignSelf="center">{data.shipmentGroup ?? '-'}</Text>
      </ListCol>

      <ListCol>
        <Text alignSelf="center">
          {data.shippedOn ? (
            <Tip content={`Zásielka odoslaná ${formatDate(data.shippedOn)}`}>
              <Deliver />
            </Tip>
          ) : (
            '-'
          )}
        </Text>
      </ListCol>

      <ListCol>
        <Text alignSelf="center">{formatTeamSize(data)}</Text>
      </ListCol>

      <ListCol>
        <Text alignSelf="center">
          {data.sizeConfirmedOn ? (
            <Tip content={`Veľkosť tímu potvrdená ${formatDate(data.sizeConfirmedOn)}`}>
              <Group />
            </Tip>
          ) : (
            '-'
          )}
        </Text>
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
  const { rowCount, rowGetter, actionPanel, onSelect } = props;

  const getHeight = ({ index }: Index) =>
    (rowGetter(index)?.team?.tags.length ?? 0) > 0 ? 100 : 50;

  return (
    <ListWrapper>
      <BaseList
        actionPanel={actionPanel}
        renderRow={(data) => <RegistrationListRow data={data} />}
        cols="350px 30px 30px 30px 80px 30px 50px 30px auto"
        rowCount={rowCount}
        rowGetter={rowGetter}
        rowHeight={getHeight}
        columnGap="medium"
        onRowSelect={(team) => onSelect && onSelect(team)}
      />
    </ListWrapper>
  );
}
