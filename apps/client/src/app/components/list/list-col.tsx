import React from 'react';
import { Box, BoxExtendedProps } from 'grommet';
import { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import styled, { css } from 'styled-components';
import { getColor } from '../../theme';

type ColumnKind = 'main' | 'detail';

interface ListColProps extends BoxExtendedProps {
  children: ReactNode;
  onClick?: () => void;
  kind?: ColumnKind;
  linkPath?: string;
  justifySelf?: string;
}

const Column = styled(Box)<{
  kind: ColumnKind;
  cursor: 'default' | 'pointer';
  bgColor?: string;
  justifySelf?: string;
}>`
  color: ${(p) => (p.kind === 'detail' ? getColor('dark-3') : 'auto')};
  background-color: ${(p) => (p.bgColor ? p.bgColor : 'auto')};
  font-size: ${(p) => (p.kind === 'detail' ? 'smaller' : 'inherit')};
  box-shadow: none;
  cursor: ${(p) => p.cursor};
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
  justify-self: ${(p) => (p.justifySelf ? p.justifySelf : undefined)};
  ${(p) =>
    p.cursor === 'pointer' &&
    css`
      color: ${getColor('brandDarker')};
      &:hover {
        color: ${getColor('brand')};
      }
    `}
`;

const StyledLink = styled(Link)`
  text-decoration: none;
`;

export function ListCol(props: ListColProps) {
  const { onClick, children, linkPath, kind, justifySelf, ...colProps } = props;
  if (linkPath) {
    return (
      <StyledLink to={linkPath}>
        <Column {...colProps} cursor="pointer" kind={kind ?? 'main'} justifySelf={justifySelf}>
          {children}
        </Column>
      </StyledLink>
    );
  }
  return (
    <Column
      {...colProps}
      cursor={onClick ? 'pointer' : 'default'}
      kind={kind ?? 'main'}
      onClick={() => onClick && onClick()}
      justifySelf={justifySelf}
    >
      {children}
    </Column>
  );
}
