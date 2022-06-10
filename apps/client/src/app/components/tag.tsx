import { Box, Tag as GrommetTag } from 'grommet';

interface TagProps {
  name?: string;
  value: string;
  onClick?: () => void;
  onRemove?: () => void;
  color?: string;
}

export const Tag = (props: TagProps) => (
  <Box margin="xsmall" round="small">
    <GrommetTag
      name={props.name}
      value={props.value}
      onClick={props.onClick}
      onRemove={props.onRemove}
    />
  </Box>
);
