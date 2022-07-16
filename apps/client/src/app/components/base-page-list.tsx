import React from 'react';
import { Box, Text, ResponsiveContext, Spinner } from 'grommet';
import { MainNavbar } from './main-navbar';

interface BaseListPageProps {
  title?: string;
  children: React.ReactNode;
  loading?: boolean;
}

export function BaseListPage(props: BaseListPageProps) {
  const { children, title, loading } = props;
  return (
    <ResponsiveContext.Consumer>
      {(responsiveSize) => (
        <Box gap="medium" pad={{ left: 'medium', right: 'medium', bottom: 'large' }} height="100vh">
          <MainNavbar responsiveSize={responsiveSize} />
          <Box>
            <Text size="xlarge" weight="bold">
              {title}
            </Text>
          </Box>
          {loading ? <Spinner /> : <Box height="100%">{children}</Box>}
        </Box>
      )}
    </ResponsiveContext.Consumer>
  );
}
