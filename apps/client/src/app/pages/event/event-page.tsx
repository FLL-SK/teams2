import React from 'react';
import { Box } from 'grommet';
import { useAppUser } from '../../components/app-user/use-app-user';
import { BasePage } from '../../components/base-page';
import { ErrorPage } from '../../components/error-page';
import { Panel } from '../../components/panel';
import { UserTags } from '../../components/user-tags';
import {
  useAddEventManagerMutation,
  useGetEventQuery,
  useRemoveEventManagerMutation,
} from '../../generated/graphql';

import { useParams } from 'react-router-dom';

import { PanelEventDetails } from './components/panel-details';
import { PanelEventFees } from './components/panel-event-fees';
import { PanelEventTeams } from './components/panel-event-teams';
import { useNotification } from '../../components/notifications/notification-provider';

export function EventPage() {
  const { id } = useParams();
  const { isAdmin, isEventManager } = useAppUser();
  const { notify } = useNotification();

  const {
    data: eventData,
    loading: eventLoading,
    error: eventError,
    refetch,
  } = useGetEventQuery({ variables: { id: id ?? '0' } });

  const [addManager] = useAddEventManagerMutation({
    onError: (e) => notify.error('Nepodarilo sa pridať manažéra turnaja.', e.message),
  });
  const [removeManager] = useRemoveEventManagerMutation({
    onError: (e) => notify.error('Nepodarilo sa odstrániť manažéra turnaja.', e.message),
  });

  const event = eventData?.getEvent;
  const canEdit = isAdmin() || isEventManager(id);

  if (!id || (eventError && !eventLoading)) {
    return <ErrorPage title="Chyba pri nahrávaní turnaja." />;
  }

  return (
    <BasePage title="Turnaj" loading={eventLoading}>
      <Box gap="medium">
        <PanelEventDetails event={event} canEdit={canEdit} />
        {canEdit && <PanelEventFees event={event} canEdit={canEdit} onChange={refetch} />}
        <PanelEventTeams event={event} canEdit={canEdit} />
        {canEdit && (
          <Panel title="Manažéri">
            <Box direction="row" wrap>
              <UserTags
                users={event?.managers ?? []}
                onAdd={(userId) => addManager({ variables: { eventId: id ?? '0', userId } })}
                onRemove={(userId) => removeManager({ variables: { eventId: id ?? '0', userId } })}
                canEdit={canEdit}
              />
            </Box>
          </Panel>
        )}
      </Box>
    </BasePage>
  );
}
