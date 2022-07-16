import React from 'react';
import { List, AutoSizer, ListRowProps } from 'react-virtualized';
import 'react-virtualized/styles.css';
import { ListRow } from '../../components/list/list-row';
import { ReactNode } from 'react';
import styled from 'styled-components';
import { breakpoints } from '../../theme';
import { Box } from 'grommet';
import { ListHeaderRow } from './list-header-row';
import { EdgeSizeType } from 'grommet/utils';

type BaseListProps<T = unknown> = {
  rowCount: number;
  rowGetter: (index: number) => T | null;
  onEmptyList?: () => unknown;
  renderRow: (data: T) => ReactNode;
  cols?: string;
  rowHeight?: number;
  actionPanel?: ReactNode | null;
  heightOffset?: number;
  columnGap?: EdgeSizeType;
  onRowSelect?: (value: T) => unknown;
  actionsJustifyContent?: string;
  footerPanel?: ReactNode | null;
};

const Container = styled.div<{ heightOffset: number }>`
  /*max-width: ${breakpoints.tablet};*/
  /*height: calc(100% - ${(p) => p.heightOffset}px);*/
  height: 100%;
  width: 100%;
`;

const ContentPanel = styled(Box)`
  height: 100%;
  width: 100%;
`;

function getRowClassName({ index }: { index: number }) {
  if (index < 0) {
    return 'ReactVirtualized__Table__row-header';
  }
  return index % 2 === 0
    ? 'ReactVirtualized__Table__row team-list__row'
    : 'ReactVirtualized__Table__row--odd team-list__row';
}

export function BaseList<T = unknown>(props: BaseListProps<T>) {
  const {
    rowCount,
    rowGetter,
    renderRow,
    cols,
    rowHeight,
    heightOffset,
    actionPanel,
    columnGap: gap,
    onRowSelect,
    actionsJustifyContent,
  } = props;

  const rowRenderer = (props: ListRowProps) => {
    // eslint-disable-next-line react/prop-types
    const { index, /*isScrolling,*/ style } = props;

    const data = rowGetter(index);
    if (!data) {
      return 'no data';
    }
    return (
      <ListRow<T>
        {...props}
        style={style}
        cols={cols}
        gap={gap}
        value={data}
        onSelect={onRowSelect}
      >
        {renderRow(data)}
      </ListRow>
    );
  };

  return (
    <Container heightOffset={heightOffset ?? 150}>
      <ListHeaderRow justifyContent={actionsJustifyContent}>{actionPanel}</ListHeaderRow>
      <ContentPanel>
        <AutoSizer>
          {({ width, height }) => (
            <List
              height={height}
              width={width}
              headerHeight={0}
              rowHeight={rowHeight ?? 80}
              rowClassName={getRowClassName}
              rowCount={rowCount}
              rowGetter={rowGetter}
              rowRenderer={rowRenderer}
              estimatedRowSize={1000}
            />
          )}
        </AutoSizer>
      </ContentPanel>
    </Container>
  );
}
