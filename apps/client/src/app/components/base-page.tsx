import React from 'react';
import { Box, Text, ResponsiveContext, Spinner, Grid } from 'grommet';
import { MainMenu } from './main-menu';
import styled from 'styled-components';
import { ForceGdprDialog } from './dialogs/force-gdpr';
import { GetRegistrationsCountDocument, GetRegistrationsCountQuery, GetRegistrationsCountQueryVariables } from '../_generated/graphql';
import { useQuery } from '@apollo/client/react';

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

  const { data: unconfirmedRegs } = useQuery<GetRegistrationsCountQuery, GetRegistrationsCountQueryVariables>(GetRegistrationsCountDocument, {
    variables: { filter: { onlyUnconfirmed: true } },
    pollInterval: 300000,
  });
  const { data: uninvoicedRegs } = useQuery<GetRegistrationsCountQuery, GetRegistrationsCountQueryVariables>(GetRegistrationsCountDocument, {
    variables: { filter: { onlyNotInvoiced: true } },
    pollInterval: 300000,
  });
  const { data: unpaidRegs } = useQuery<GetRegistrationsCountQuery, GetRegistrationsCountQueryVariables>(GetRegistrationsCountDocument, {
    variables: { filter: { onlyUnpaid: true } },
    pollInterval: 300000,
  });
  const { data: unshippedRegs } = useQuery<GetRegistrationsCountQuery, GetRegistrationsCountQueryVariables>(GetRegistrationsCountDocument, {
    variables: { filter: { onlyNotShipped: true } },
    pollInterval: 300000,
  });

  const regCount = {
    unconfirmed: unconfirmedRegs?.getRegistrationsCount ?? 0,
    uninvoiced: uninvoicedRegs?.getRegistrationsCount ?? 0,
    unpaid: unpaidRegs?.getRegistrationsCount ?? 0,
    unshipped: unshippedRegs?.getRegistrationsCount ?? 0,
  };

  return (
    <ResponsiveContext.Consumer>
      {(responsiveSize) => (
        <Grid columns={['150px', 'auto']}>
          <MainMenu responsiveSize={responsiveSize} regCount={regCount} />
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
