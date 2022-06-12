import { Box, Markdown, Text } from 'grommet';
import { BorderType } from 'grommet/utils';
import styled from 'styled-components';
import { ProgramFragmentFragment } from '../generated/graphql';
import { getColor } from '../theme';

interface ProgramTileProps {
  program: ProgramFragmentFragment;
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
  const border: BorderType = selected ? { color: getColor('brand') } : {};

  return (
    <Container pad="medium" gap="medium" onClick={onClick} background="light-2" border={border}>
      <Text size="large">{program.name}</Text>
      <Markdown>{program.description ?? ''}</Markdown>
    </Container>
  );
}
