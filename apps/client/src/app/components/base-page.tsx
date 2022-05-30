import { Box, Text, ResponsiveContext } from 'grommet';
import { MainNavbar } from './main-navbar';

interface BasePageProps {
  title?: string;
  children: React.ReactNode;
}

export function BasePage(props: BasePageProps) {
  const { children, title } = props;

  return (
    <ResponsiveContext.Consumer>
      {(responsiveSize) => (
        <Box gap="medium">
          <MainNavbar responsiveSize={responsiveSize} />
          <Box>
            <Text size="xlarge" weight="bold">
              {title}
            </Text>
          </Box>
          <Box>{children}</Box>
        </Box>
      )}
    </ResponsiveContext.Consumer>
  );
}
