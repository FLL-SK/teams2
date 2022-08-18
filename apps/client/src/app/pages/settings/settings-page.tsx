import React from 'react';
import { BasePage } from '../../components/base-page';

import { PanelGroup } from '../../components/panel';
import { useGetSettingsQuery } from '../../generated/graphql';

import { useAppUser } from '../../components/app-user/use-app-user';
import { ErrorPage } from '../../components/error-page';
import { PanelSettings } from './components/panel-settings';

export function SettingsPage() {
  const { user, userLoading: loading } = useAppUser();
  const { data: settingsData } = useGetSettingsQuery();

  if (!loading && !user?.isAdmin) {
    return <ErrorPage title="Nemáte oprávnenie." />;
  }

  return (
    <BasePage title="Nastavenia" loading={loading}>
      <PanelGroup>
        <PanelSettings settings={settingsData?.getSettings} />
      </PanelGroup>
    </BasePage>
  );
}
