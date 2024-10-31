import React from 'react';
import { Box, Button, Spinner, Text } from 'grommet';
import { useAppUser } from '../../components/app-user/use-app-user';
import { BasePage } from '../../components/base-page';
import { ErrorPage } from '../../components/error-page';
import { Panel } from '../../components/panel';
import { UserTags } from '../../components/user-tags';
import {
  useAddEventManagerMutation,
  useGetEventLazyQuery,
  useGetRegisteredTeamsLazyQuery,
  useIssueEventFoodInvoicesMutation,
  useRemoveEventManagerMutation,
  useUndeleteEventMutation,
} from '../../_generated/graphql';

import { useParams } from 'react-router-dom';

import { PanelEventDetails } from './components/panel-details';
import { PanelEventFees } from './components/panel-event-fees';
import { PanelEventTeams } from './components/panel-event-teams';
import { useNotification } from '../../components/notifications/notification-provider';
import { PanelEventFood } from './components/panel-event-food';

export function EventPage() {
  const { id } = useParams();
  const { isAdmin, isEventManager } = useAppUser();
  const { notify } = useNotification();

  const [fetchEvent, { data: eventData, loading: eventLoading, error: eventError, refetch }] =
    useGetEventLazyQuery({ fetchPolicy: 'cache-and-network' });

  const [fetchReistrations, { data: regData }] = useGetRegisteredTeamsLazyQuery({
    fetchPolicy: 'cache-and-network',
  });

  const [undeleteEvent] = useUndeleteEventMutation({
    onError: (e) => notify.error('Nepodarilo sa obnoviť turnaj.', e.message),
  });
  const [addManager] = useAddEventManagerMutation({
    onError: (e) => notify.error('Nepodarilo sa pridať manažéra turnaja.', e.message),
  });
  const [removeManager] = useRemoveEventManagerMutation({
    onError: (e) => notify.error('Nepodarilo sa odstrániť manažéra turnaja.', e.message),
  });

  const [issueFoodInvoices] = useIssueEventFoodInvoicesMutation({
    onError: (e) => notify.error('Nepodarilo sa vystaviť faktúry za stravovanie.', e.message),
  });

  React.useEffect(() => {
    if (id) {
      fetchEvent({ variables: { id } });
      fetchReistrations({
        variables: { eventId: id, includeCoaches: canEdit },
      });
    }
  }, [id, fetchEvent]);

  const event = eventData?.getEvent;
  const regs = regData?.getRegisteredTeams ?? [];
  const canEdit = isAdmin() || isEventManager(id);
  const isDeleted = !!event?.deletedOn;

  if (!id || (eventError && !eventLoading)) {
    return <ErrorPage title="Chyba pri nahrávaní turnaja." />;
  }

  return (
    <BasePage title="Turnaj">
      {eventLoading || !event ? (
        <Spinner />
      ) : (
        <Box gap="medium">
          {isDeleted && (
            <Box direction="row" gap="medium" align="center">
              <Text color="status-error">Turnaj bol zrušený.</Text>
              {isAdmin() && (
                <Button
                  size="small"
                  label="Obnoviť turnaj"
                  onClick={() => undeleteEvent({ variables: { id: event.id } })}
                />
              )}
            </Box>
          )}
          <PanelEventDetails event={event} canEdit={canEdit} />

          <PanelEventFees
            event={event}
            canEdit={canEdit && (event.ownFeesAllowed ?? false)}
            onChange={refetch}
            publicOnly={!canEdit}
          />

          <PanelEventFood event={event} registrations={regs} canEdit={canEdit} onChange={refetch} />

          <PanelEventTeams
            event={event}
            canEdit={canEdit}
            registrations={regs}
            onIssueInvoices={async () => {
              const result = await issueFoodInvoices({ variables: { eventId: event.id } });
              if (result.data?.issueEventFoodInvoices) {
                notify.info(
                  `Vystavené faktúry za stravovanie pre ${result.data?.issueEventFoodInvoices} tímov.`,
                );
                refetch();
              }
            }}
          />
          {canEdit && (
            <Panel title="Manažéri">
              <Box direction="row" wrap>
                <UserTags
                  users={event.managers ?? []}
                  onAdd={(userId) => addManager({ variables: { eventId: id, userId } })}
                  onRemove={(userId) => removeManager({ variables: { eventId: id, userId } })}
                  canEdit={canEdit}
                />
              </Box>
            </Panel>
          )}
        </Box>
      )}
    </BasePage>
  );
}
