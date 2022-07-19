import React, { ReactNode } from 'react';
import { Box, Text } from 'grommet';
import { ListCol } from '../../../components/list/list-col';
import { TextStriked } from '../../../components/text-striked';
import { TeamListFragmentFragment } from '../../../generated/graphql';
import { BaseList } from '../../../components/list/base-list';
import { appPath } from '@teams2/common';
import { fullAddress } from '../../../utils/format-address';
import styled from 'styled-components';
import { Tag } from '../../../components/tag';

type TeamListProps = {
  rowCount: number;
  rowGetter: (index: number) => TeamListFragmentFragment | null;
  onEmptyList?: () => unknown;
  actionPanel: ReactNode;
  onSelect: (team: TeamListFragmentFragment) => unknown;
};

interface TeamListRowProps {
  data: TeamListFragmentFragment;
}

function TeamListRow(props: TeamListRowProps) {
  const { data } = props;
  return (
    <>
      <ListCol linkPath={appPath.team(data.id)}>
        <TextStriked striked={!!data.deletedOn}>{data.name}</TextStriked>
      </ListCol>

      <ListCol>
        <Text>{fullAddress(data.address)}</Text>
      </ListCol>
      <ListCol>
        <Box direction="row">
          {data.tags.map((tag) => (
            <Tag key={tag.id} value={tag.label} size="small" />
          ))}
        </Box>
      </ListCol>
    </>
  );
}

const ListWrapper = styled(Box)`
  overflow-x: clip;
  overflow-y: hidden;
  min-height: 100%;
`;

export function TeamList(props: TeamListProps) {
  const { rowCount, rowGetter, actionPanel, onSelect } = props;

  return (
    <ListWrapper>
      <BaseList
        actionPanel={actionPanel}
        renderRow={(data) => <TeamListRow data={data} />}
        cols="1fr 2fr 1fr"
        rowCount={rowCount}
        rowGetter={rowGetter}
        rowHeight={50}
        columnGap="medium"
        onRowSelect={(team) => onSelect && onSelect(team)}
      />
    </ListWrapper>
  );
}
