import { Box, Header, Nav, Anchor, Sidebar } from 'grommet';

interface MainNavbarProps {
  responsiveSize: string;
}

export function MainNavbar(props: MainNavbarProps) {
  const { responsiveSize } = props;
  return (
    <Header background={'light-2'} pad="medium">
      {responsiveSize === 'small' ? (
        <Box alignSelf="end">
          <Sidebar>
            <Nav direction="column">
              <Anchor href="#" label="This is" />
              <Anchor href="#" label="The Nav" />
              <Anchor href="#" label="Component" />
            </Nav>
          </Sidebar>
        </Box>
      ) : (
        <Nav direction="row">
          <Anchor href="#" label="This is" />
          <Anchor href="#" label="The Nav" />
          <Anchor href="#" label="Component" />
        </Nav>
      )}
    </Header>
  );
}
