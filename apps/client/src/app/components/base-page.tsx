import React from 'react';
import { Box, Text, ResponsiveContext, Spinner, Grid } from 'grommet';
import { MainMenu } from './main-menu';
import styled from 'styled-components';
import { ForceGdprDialog } from './dialogs/force-gdpr';

interface BasePageProps {
  title?: string;
  children: React.ReactNode;
  loading?: boolean;
}

const PageWrapper = styled(Box)`
  max-height: 100%;
  width: 100%;
  overflow: auto;
`;

const PageContent = styled(Box)`
  height: 100%;
  width: 100%;
  /*overflow: auto;*/
`;

const PageTitle = ({ title }: { title?: string }) => (
  <Box margin={{ bottom: 'medium' }}>
    <Text size="xlarge" weight="bold">
      {title}
    </Text>
  </Box>
);

export function BasePage(props: BasePageProps) {
  const { children, title, loading } = props;
  return (
    <ResponsiveContext.Consumer>
      {(responsiveSize) => (
        <Grid columns={['150px', 'auto']}>
          <MainMenu responsiveSize={responsiveSize} />
          <PageWrapper pad="medium">
            <PageTitle title={title} />
            {loading ? <Spinner /> : <PageContent>{children}</PageContent>}
          </PageWrapper>
          <ForceGdprDialog />
        </Grid>
      )}
    </ResponsiveContext.Consumer>
  );
}
