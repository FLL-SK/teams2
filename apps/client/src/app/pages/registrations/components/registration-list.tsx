import React, { ReactNode } from 'react';
import { Box, Text } from 'grommet';
import { ListCol } from '../../../components/list/list-col';
import { TextStriked } from '../../../components/text-striked';
import { RegistrationTeamFragmentFragment } from '../../../generated/graphql';
import { BaseList } from '../../../components/list/base-list';
import { appPath } from '@teams2/common';
import { fullAddress } from '../../../utils/format-address';
import styled from 'styled-components';
import { Tag } from '../../../components/tag';
import { formatDate } from '@teams2/dateutils';

type RegistrationListProps = {
  rowCount: number;
  rowGetter: (index: number) => RegistrationTeamFragmentFragment | null;
  onEmptyList?: () => unknown;
  actionPanel: ReactNode;
  onSelect: (team: RegistrationTeamFragmentFragment) => unknown;
};

interface RegistrationListRowProps {
  data: RegistrationTeamFragmentFragment;
}

function RegistrationListRow(props: RegistrationListRowProps) {
  const { data } = props;
  return (
    <>
      <ListCol linkPath={appPath.team(data.team.id)}>
        <TextStriked striked={!!data.team.deletedOn}>{data.team.name}</TextStriked>
        <Text size="small" color="dark-5">
          {fullAddress(data.team.address)}
        </Text>
      </ListCol>
      <ListCol>
        <Box direction="row">
          {data.team.tags.map((tag) => (
            <Tag key={tag.id} value={tag.label} size="small" />
          ))}
        </Box>
      </ListCol>
      <ListCol>
        <Text>{formatDate(data.registeredOn)}</Text>
      </ListCol>
      <ListCol>
        <Text>{data.invoiceIssuedOn ? formatDate(data.invoiceIssuedOn) : '-'}</Text>
      </ListCol>
      <ListCol>
        <Text>{data.paidOn ? formatDate(data.paidOn) : '-'}</Text>
      </ListCol>
      <ListCol>
        <Text>{data.shipmentGroup ?? '-'}</Text>
      </ListCol>

      <ListCol>
        <Text>{data.shippedOn ? formatDate(data.shippedOn) : '-'}</Text>
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

  return (
    <ListWrapper>
      <BaseList
        actionPanel={actionPanel}
        renderRow={(data) => <RegistrationListRow data={data} />}
        cols="1fr 1fr 100px 100px 100px 100px 100px"
        rowCount={rowCount}
        rowGetter={rowGetter}
        rowHeight={50}
        columnGap="medium"
        onRowSelect={(team) => onSelect && onSelect(team)}
      />
    </ListWrapper>
  );
}
