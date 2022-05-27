import { Box, ResponsiveContext } from 'grommet';
import { MainNavbar } from './main-navbar';

interface BasePageProps {
  children: React.ReactNode;
}

export function BasePage(props: BasePageProps) {
  const { children } = props;
  return (
    <ResponsiveContext.Consumer>
      {(responsiveSize) => (
        <>
          <MainNavbar responsiveSize={responsiveSize} />
          <Box pad="medium">{children}</Box>
        </>
      )}
    </ResponsiveContext.Consumer>
  );
}
