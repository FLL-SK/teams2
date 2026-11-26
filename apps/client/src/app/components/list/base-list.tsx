import { List, ListProps, RowRendererParams } from 'react-virtualized';
import { AutoSizer } from 'react-virtualized-auto-sizer';
import 'react-virtualized/styles.css';
import { ListRow } from '../../components/list/list-row';
import { ReactNode } from 'react';
import styled from 'styled-components';
import { Box } from 'grommet';
import { ListHeaderRow } from './list-header-row';
import { EdgeSizeType } from 'grommet/utils';

interface BaseListProps<T = unknown> extends Omit<ListProps, 'height' | 'width' | 'rowRenderer'> {
  rowCount: number;
  rowGetter: (index: number) => T | null;
  onEmptyList?: () => ReactNode;
  renderRow: (data: T) => ReactNode;
  cols?: string;
  actionPanel?: ReactNode | null;
  heightOffset?: number;
  columnGap?: EdgeSizeType;
  onRowSelect?: (value: T) => unknown;
  actionsJustifyContent?: string;
  footerPanel?: ReactNode | null;
}

const ContentPanel = styled(Box)`
  height: 90%;
  width: 100%;
`;

// rovnaké správanie ako AutoSizer z react-virtualized 9 – obal nemá vlastnú veľkosť,
// meria sa rodičovský element
const autoSizerStyle = { width: 0, height: 0, overflow: 'visible' } as const;

export function BaseList<T = unknown>(props: BaseListProps<T>) {
  const {
    rowCount,
    rowGetter,
    renderRow,
    cols,
    rowHeight,
    actionPanel,
    columnGap: gap,
    onRowSelect,
    actionsJustifyContent,
    ...listProps
  } = props;

  const rowRenderer = (props: RowRendererParams) => {
    const { index, /*isScrolling,*/ style } = props;

    const data = rowGetter(index);
    if (!data) {
      return (
        <div key={props.key} style={style}>
          no data
        </div>
      );
    }
    return (
      <ListRow<T>
        key={props.key}
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
    <Box height="100%">
      <ListHeaderRow justifyContent={actionsJustifyContent}>{actionPanel}</ListHeaderRow>
      <ContentPanel>
        {rowCount === 0 && props.onEmptyList && props.onEmptyList()}
        {rowCount > 0 && (
          <AutoSizer
            style={autoSizerStyle}
            renderProp={({ width, height }) =>
              width !== undefined &&
              height !== undefined && (
                <List
                  {...listProps}
                  height={height}
                  width={width}
                  rowHeight={rowHeight}
                  rowCount={rowCount}
                  rowRenderer={rowRenderer}
                  estimatedRowSize={1000}
                />
              )
            }
          />
        )}
      </ContentPanel>
    </Box>
  );
}
