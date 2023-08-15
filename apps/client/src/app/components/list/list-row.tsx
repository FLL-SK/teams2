import React from 'react';
import { Box } from 'grommet';
import { EdgeSizeType, PadType } from 'grommet/utils';
import { ReactNode } from 'react';
import styled from 'styled-components';
import { Density, getColor, margins } from '../../theme';

const Container = styled(Box)<{ cols: string; padding?: PadType; gap?: EdgeSizeType }>`
  border-bottom: 1px solid ${getColor('light-2')};
  padding: ${(p) => p.padding};
  display: grid;
  grid-auto-flow: column;
  align-items: center;
  justify-content: start;
  grid-gap: ${(p) => (p.gap ? margins[p.gap] : margins['medium'])};
  grid-template-columns: ${(p) => p.cols};
  background-color: ${getColor('white')};
  :hover {
    background-color: ${getColor('light-2')};
  }
`;

interface ListRowProps<T = unknown> {
  children: ReactNode;
  cols?: string;
  density?: Density;
  gap?: EdgeSizeType;
  pad?: PadType;
  style?: React.CSSProperties
  onSelect?: (value: T) => unknown;
  value?: T; // value to be returned onSelect
}

export function ListRow<T = unknown>(props: ListRowProps<T>) {
  const { children, cols, gap, pad, style, value, onSelect } = props;
  return (
    <Container
      style={style}
      cols={cols ?? 'auto'}
      padding={pad}
      gap={gap}
      onClick={() => onSelect && value && onSelect(value)}
    >
      {children}
    </Container>
  );
}
