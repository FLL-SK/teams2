import styled from 'styled-components';
import { Text } from 'grommet';

export const JustifiedText = styled(Text)<{ justify?: 'start' | 'center' | 'end' }>`
  justify-self: ${({ justify }) => (justify ? justify : 'start')};
`;
