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
  disabled?: boolean;
  showNotice?: boolean;
}

const Container = styled(Box)`
  cursor: 'pointer';
  :hover {
    background-color: ${getColor('light-4')};
  }
`;

export function ProgramTile(props: ProgramTileProps) {
  const { program, onClick, selected, disabled, showNotice } = props;
  const border: BorderType = selected ? { color: getColor('brand'), size: 'large' } : {};

  let maxColor = undefined;
  let notice = undefined;
  if (program.maxTeams && program.regCount >= program.maxTeams) {
    maxColor = 'status-critical';
    notice = 'Program je naplnený';
  } else if (program.maxTeams && program.maxTeams - program.regCount < 3) {
    maxColor = 'status-warning';
    notice = 'Posledné miesta';
  }

  return (
    <Container
      pad="medium"
      gap="medium"
      onClick={disabled ? undefined : onClick}
      background={program.colorLight ?? 'light-2'}
      border={border}
    >
      <Box direction="row" justify="between">
        <Text>{program.name}</Text>
        {showNotice && <Text color={maxColor}>{notice}</Text>}
      </Box>
      <Markdown>{program.description ?? ''}</Markdown>
    </Container>
  );
}
