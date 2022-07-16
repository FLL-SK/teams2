import styled from 'styled-components';
import { Text } from 'grommet';

export const TextStriked = styled(Text)<{ striked?: boolean }>`
  text-decoration: ${(p) => (p.striked ? 'line-through' : undefined)};
`;
