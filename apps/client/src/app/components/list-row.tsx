import React from 'react';
import { Box, BoxExtendedProps } from 'grommet';
import styled from 'styled-components';
import { getColor } from '../theme';

interface ListRowProps extends BoxExtendedProps {
  columns: string;
}

const Container = styled(Box)<ListRowProps>`
  width: 100%;
  display: grid;
  grid-template-columns: ${(props) => props.columns};
  :hover {
    background-color: ${getColor('active')};
    cursor: pointer;
  }
`;

export const ListRow2 = ({ columns, ...rest }: ListRowProps) => (
  <Container direction="row" columns={columns} {...rest} />
);

export const ListHeader2 = styled(Box)<ListRowProps>`
  font-weight: bold;
  text-decoration: underline;
  width: 100%;
  display: grid;
  grid-template-columns: ${({ columns }) => columns};
`;
