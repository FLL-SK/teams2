import { Box, Text } from 'grommet';

interface LabelValueProps {
  label: string;
  labelWidth?: string;
  value?: string;
  direction?: 'row' | 'column';
}

export const LabelValue = (props: LabelValueProps) => {
  const { label, value = '', direction = 'row', labelWidth } = props;
  return (
    <Box direction={direction} gap="medium">
      <Box width={labelWidth}>
        <Text weight="bold">{label}</Text>
      </Box>
      <Text>{value}</Text>
    </Box>
  );
};
