import { Box, Text, Tag as GrommetTag, Button } from 'grommet';
import { Close } from 'grommet-icons';
import styled from 'styled-components';

interface TagProps {
  value: string;
  onClick?: () => void;
  onRemove?: () => void;
  color?: string;
}

const RedClose = styled(Close)`
  :hover {
    stroke: red;
  }
`;

export function Tag(props: TagProps) {
  const { value, onClick, onRemove, color } = props;
  return (
    <Box
      margin="xsmall"
      round="small"
      direction="row"
      gap="small"
      border="all"
      align="center"
      pad="xsmall"
      color={color}
    >
      {onClick ? (
        <Button plain onClick={onClick}>
          {value}
        </Button>
      ) : (
        <Text>{value}</Text>
      )}
      {onRemove && <Button plain icon={<RedClose size="small" />} onClick={onRemove} />}
    </Box>
  );
}
