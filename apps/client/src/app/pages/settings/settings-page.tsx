import React from 'react';
import { BasePage } from '../../components/base-page';
import { useGetSettingsQuery } from '../../_generated/graphql';
import { useAppUser } from '../../components/app-user/use-app-user';
import { ErrorPage } from '../../components/error-page';
import { PanelSettings } from './components/panel-settings';
import { PanelTags } from './components/panel-tags';
import { Box, Heading } from 'grommet';

export function SettingsPage() {
  const { user, userLoading: loading } = useAppUser();
  const { data: settingsData } = useGetSettingsQuery();

  if (!loading && !user?.isAdmin) {
    return <ErrorPage title="Nemáte oprávnenie." />;
  }

  return (
    <BasePage title="Nastavenia" loading={loading}>
      <Box gap="medium">
        <Box>
          <Heading level="4">Základné nastavenia</Heading>
          <PanelSettings settings={settingsData?.getSettings} />
        </Box>
        <Box>
          <Heading level="4">Štítky</Heading>
          <PanelTags />
        </Box>
      </Box>
    </BasePage>
  );
}
