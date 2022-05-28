import { Box, Header, ResponsiveContext } from 'grommet';
import { MainNavbar } from './main-navbar';
import { useAuthenticate } from './useAuthenticate';

interface BasePageProps {
  title?: string;
  children: React.ReactNode;
}

export function BasePage(props: BasePageProps) {
  const { children, title } = props;

  return (
    <ResponsiveContext.Consumer>
      {(responsiveSize) => (
        <>
          <MainNavbar responsiveSize={responsiveSize} />
          <Box>
            <Header>{title}</Header>
          </Box>
          <Box pad="medium">{children}</Box>
        </>
      )}
    </ResponsiveContext.Consumer>
  );
}
