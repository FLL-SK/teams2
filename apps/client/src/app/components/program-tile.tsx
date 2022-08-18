import React from 'react';
import { Box, Markdown, Text } from 'grommet';
import { BorderType } from 'grommet/utils';
import styled from 'styled-components';
import { ProgramListFragmentFragment } from '../generated/graphql';
import { getColor } from '../theme';

interface ProgramTileProps {
  program: ProgramListFragmentFragment;
  onClick?: () => void;
  selected?: boolean;
}

const Container = styled(Box)`
  cursor: 'pointer';
  :hover {
    background-color: ${getColor('light-4')};
  }
`;

export function ProgramTile(props: ProgramTileProps) {
  const { program, onClick, selected } = props;
  const border: BorderType = selected ? { color: getColor('brand'), size: 'large' } : {};

  return (
    <Container
      pad="medium"
      gap="medium"
      onClick={onClick}
      background={program.colorLight ?? 'light-2'}
      border={border}
    >
      <Text>{program.name}</Text>
      <Markdown>{program.description ?? ''}</Markdown>
    </Container>
  );
}
