import { Box, Text } from 'grommet';

interface PanelProps {
  title?: string;
  children: React.ReactNode;
}

export function Panel(props: PanelProps) {
  const { children, title } = props;

  return (
    <Box background="light-2" gap="small">
      <Box pad="medium" background="#85C1E9">
        <Text weight="bold" size="medium">
          {title}{' '}
        </Text>
      </Box>
      <Box pad={{ vertical: 'small', horizontal: 'medium' }}>{children}</Box>
    </Box>
  );
}

export const PanelGroup = ({ children }: { children: React.ReactNode }) => (
  <Box gap="medium">{children}</Box>
);
