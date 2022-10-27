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
    <Container onClick={disabled ? undefined : onClick} border={border}>
      <Box direction="row" gap="small" pad="small" align="center">
        <Box width="50px" height={{ min: '50px' }} background={program.color ?? 'light-5'} />
        <Box width="100%">
          <Box direction="row" justify="between">
            <Text>{program.name}</Text>
            {showNotice && <Text color={maxColor}>{notice}</Text>}
          </Box>
          <Markdown>{program.description ?? ''}</Markdown>
        </Box>
      </Box>
    </Container>
  );
}
