import React from 'react';
import { Box, Button, Spinner, Text } from 'grommet';
import { useAppUser } from '../../components/app-user/use-app-user';
import { BasePage } from '../../components/base-page';
import { ErrorPage } from '../../components/error-page';
import { Panel } from '../../components/panel';
import { UserTags } from '../../components/user-tags';
import {
  useAddEventFoodTypeMutation,
  useAddEventManagerMutation,
  useGetEventLazyQuery,
  useGetProgramRegistrationsLazyQuery,
  useGetRegisteredTeamsLazyQuery,
  useInviteTeamToEventMutation,
  useIssueEventFoodInvoicesMutation,
  useRemoveEventFoodTypeMutation,
  useRemoveEventManagerMutation,
  useToggleEventFoodOrderEnabledMutation,
  useUnarchiveEventMutation,
  useUndeleteEventMutation,
  useUninviteTeamFromEventMutation,
  useUpdateEventFoodOrderDeadlineMutation,
  useUpdateEventFoodTypeMutation,
} from '../../_generated/graphql';

import { useParams } from 'react-router-dom';

import { PanelEventDetails } from './components/panel-details';
import { PanelEventFees } from './components/panel-event-fees';
import { PanelEventTeams } from './components/panel-event-teams';
import { useNotification } from '../../components/notifications/notification-provider';
import { PanelEventFood } from './components/panel-event-food';

export function EventPage() {
  const { id } = useParams();
  const { isAdmin, isEventManager, isProgramManager } = useAppUser();
  const { notify } = useNotification();

  const [fetchEvent, { data: eventData, loading: eventLoading, error: eventError, refetch }] =
    useGetEventLazyQuery({
      fetchPolicy: 'cache-and-network',
      onError: (e) => notify.error('Nepodarilo sa načitať údaje o turnaji.', e.message),
    });

  const [fetchRegistrations, { data: regData }] = useGetRegisteredTeamsLazyQuery({
    fetchPolicy: 'cache-and-network',
    onError: (e) => notify.error('Nepodarilo sa načitať registrácie pre turnaj.', e.message),
  });

  const [fetchProgramRegistrations, { data: progRegs }] = useGetProgramRegistrationsLazyQuery({
    fetchPolicy: 'cache-and-network',
    onError: (e) => notify.error('Nepodarilo sa načítať registrácie pre program.', e.message),
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

  const [updateFoodType] = useUpdateEventFoodTypeMutation({
    onError: (e) => notify.error('Nepodarilo sa upraviť typ stravovania.', e.message),
  });

  const [addFoodType] = useAddEventFoodTypeMutation({
    onError: (e) => notify.error('Nepodarilo sa pridať typ stravovania.', e.message),
  });

  const [removeFoodType] = useRemoveEventFoodTypeMutation({
    onError: (e) => notify.error('Nepodarilo sa odstrániť typ stravovania.', e.message),
  });

  const [updateFoodOrderDeadline] = useUpdateEventFoodOrderDeadlineMutation({
    onError: (e) =>
      notify.error('Nepodarilo sa upraviť deadline na objednávky stravovania.', e.message),
  });

  const [inviteTeam] = useInviteTeamToEventMutation({
    onError: (e) => notify.error('Nepodarilo sa pozvať tím na turnaj.', e.message),
  });

  const [uninviteTeam] = useUninviteTeamFromEventMutation({
    onError: (e) => notify.error('Nepodarilo sa zrušiť pozvánku tímu na turnaj.', e.message),
  });

  const [unarchiveEvent] = useUnarchiveEventMutation({
    onError: (e) => notify.error('Nepodarilo sa obnoviť turnaj.', e.message),
  });

  const [toggleFoodOrderEnabled] = useToggleEventFoodOrderEnabledMutation({
    onError: (e) => notify.error('Nepodarilo sa zmeniť stav objednávania jedla.', e.message),
  });

  React.useEffect(() => {
    if (id) {
      fetchEvent({ variables: { id } });
    }
  }, [id, fetchEvent]);

  const event = eventData?.getEvent;
  const regs = regData?.getRegisteredTeams ?? [];
  const isDeleted = !!event?.deletedOn;
  const isArchived = !!event?.archivedOn;

  const canEdit = React.useMemo(
    () => isAdmin() || isEventManager(id) || isProgramManager(event?.programId),
    [isAdmin, isEventManager, isProgramManager, id, eventData],
  );

  React.useEffect(() => {
    if (id) {
      fetchRegistrations({
        variables: { eventId: id, includeCoaches: canEdit },
      });
    }
  }, [id, fetchRegistrations, canEdit]);

  const invitableTeams = React.useMemo(() => {
    if (!progRegs?.getProgramRegistrations) {
      return [];
    }
    const it: { id: string; name: string; teamNo: string }[] = progRegs.getProgramRegistrations.map(
      (r) => ({
        id: r.teamId,
        name: r.team?.name,
        teamNo: r.teamNo ?? 'xxx',
      }),
    );
    it.sort((a, b) => a.name.localeCompare(b.name));
    return it;
  }, [progRegs, regs]);

  React.useEffect(() => {
    if (event?.programId && event?.invitationOnly) {
      fetchProgramRegistrations({ variables: { programId: event.programId } });
    }
  }, [event?.programId, fetchProgramRegistrations]);

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
              {(isAdmin() || isEventManager(event.id) || isProgramManager(event.programId)) && (
                <Button
                  size="small"
                  label="Obnoviť turnaj"
                  onClick={() => undeleteEvent({ variables: { id: event.id } })}
                />
              )}
            </Box>
          )}
          {isArchived && (
            <Box direction="row" gap="medium" align="center">
              <Text color="status-error">Turnaj nie je aktívny.</Text>
              {(isAdmin() || isEventManager(event.id) || isProgramManager(event.programId)) && (
                <Button
                  size="small"
                  label="Aktivovať turnaj"
                  onClick={() => unarchiveEvent({ variables: { eventId: event.id } })}
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

          <PanelEventFood
            event={event}
            registrations={regs}
            canEdit={canEdit}
            hideQty={!canEdit}
            onChange={refetch}
            onIssueInvoices={async () => {
              const result = await issueFoodInvoices({ variables: { eventId: event.id } });

              if (result.data?.issueEventFoodInvoices) {
                const inv = result.data.issueEventFoodInvoices;
                const errors = inv.reduce((acc, i) => (i.errors ? acc + 1 : acc), 0);
                const issued = inv.length - errors;
                notify.info(
                  `Vystavené faktúry za stravovanie pre ${issued} tímov. Chyby: ${errors ?? 0}`,
                );
                for (const i of inv) {
                  if (i.errors) {
                    notify.error(
                      `Nepodarilo sa vystavit fakturu pre tim ${i.registration?.teamNo}.`,
                      i.errors[0].message ?? 'Neznáma chyba',
                    );
                  }
                }
                refetch();
              } else {
                notify.info('Neboli vystavené žiadne nové faktúry za stravovanie.');
              }
            }}
            onModifyItem={async (foodType) => {
              const result = await updateFoodType({
                variables: { eventId: event.id, foodType },
              });
              if (result.data?.updateEventFoodType) {
                notify.info('Typ stravovania bol upravený.');
              }
            }}
            onAddItem={async () => {
              const result = await addFoodType({ variables: { eventId: event.id } });
              if (result.data?.addEventFoodType) {
                notify.info('Typ stravovania bol pridaný.');
              }
            }}
            onRemoveItem={async (i) => {
              if (!i.id) {
                return;
              }
              const result = await removeFoodType({
                variables: { eventId: event.id, foodTypeId: i.id },
              });
              if (result.data?.removeEventFoodType) {
                notify.info('Typ stravovania bol odstránený.');
              }
            }}
            onModifyDeadline={async (d) => {
              const result = await updateFoodOrderDeadline({
                variables: { eventId: event.id, deadline: d.toISOString() },
              });
              if (result.data?.updateEventFoodOrderDeadline) {
                notify.info('Termín pre objednávky stravovania bol upravený.');
              }
            }}
            onEnableFoodOrders={async () => {
              const result = await toggleFoodOrderEnabled({
                variables: { eventId: event.id, enable: true },
              });
              if (result.data?.toggleEventFoodOrderEnabled) {
                notify.info('Objednávanie stravovania bolo zapnuté.');
              }
            }}
            onDisableFoodOrders={async () => {
              const result = await toggleFoodOrderEnabled({
                variables: { eventId: event.id, enable: false },
              });
              if (result.data?.toggleEventFoodOrderEnabled) {
                notify.info('Objednávanie stravovania bolo vypnuté.');
              }
            }}
          />

          <PanelEventTeams
            event={event}
            canEdit={canEdit}
            registrations={regs}
            invitableTeams={invitableTeams}
            onInvite={async (teamId) => {
              await inviteTeam({ variables: { eventId: id, teamId } });
            }}
            onUninvite={async (teamId) => {
              await uninviteTeam({ variables: { eventId: id, teamId } });
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
