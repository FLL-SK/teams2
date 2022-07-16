import React from 'react';
import { Box } from 'grommet';
import { ReactNode } from 'react';
import styled from 'styled-components';
import { appLayout, getColor, margins } from '../../theme';

const Container = styled(Box)`
  background-color: ${getColor('light-1')};
  border: 1px ${getColor('light-2')} solid;
  border-top-left-radius: ${appLayout.borderRadius.small};
  border-top-right-radius: ${appLayout.borderRadius.small};
  min-height: auto;
  display: block;
  padding: ${margins.small} ${margins.medium};
`;

const Wrapper = styled(Box)<{ justifyContent?: string }>`
  display: grid;
  grid-auto-columns: auto;
  grid-auto-flow: column;
  justify-content: ${(p) => (p.justifyContent ? p.justifyContent : 'start')};
  align-items: center;
  grid-gap: ${margins.medium};
`;

interface ListHeaderRowProps {
  children: ReactNode;
  justifyContent?: string;
}

export function ListHeaderRow(props: ListHeaderRowProps) {
  const { children, justifyContent } = props;
  return (
    <Container>
      <Wrapper justifyContent={justifyContent}>{children}</Wrapper>
    </Container>
  );
}
