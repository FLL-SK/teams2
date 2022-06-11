import { appPath } from '@teams2/common';
import { formatDate } from '@teams2/dateutils';
import { Anchor, Box, Button, Spinner, Tag } from 'grommet';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppUser } from '../../components/app-user/use-app-user';
import { BasePage } from '../../components/base-page';
import { EditEventDialog } from '../../components/dialogs/edit-event-dialog';
import { LabelValue } from '../../components/label-value';
import { Panel } from '../../components/panel';
import { UserTags } from '../../components/user-tags';
import {
  useAddEventManagerMutation,
  useGetEventLazyQuery,
  useRemoveEventManagerMutation,
  useUpdateEventMutation,
} from '../../generated/graphql';

export function EventPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { isAdmin, isEventManager } = useAppUser();

  const [getEvent, { data: eventData, loading: eventLoading, error: eventError }] =
    useGetEventLazyQuery();
  const [navLink, setNavLink] = useState<string>();
  const [showEventEditDialog, setShowEventEditDialog] = useState(false);

  const [updateEvent] = useUpdateEventMutation();
  const [addManager] = useAddEventManagerMutation();
  const [removeManager] = useRemoveEventManagerMutation();

  useEffect(() => {
    if (id) {
      getEvent({ variables: { id } });
    }
  }, [getEvent, id]);

  useEffect(() => {
    if (navLink) {
      navigate(navLink);
    }
    return () => {
      setNavLink(undefined);
    };
  }, [navLink, navigate]);

  if ((!id || eventError) && !navLink) {
    setNavLink(appPath.page404);
  }

  const event = eventData?.getEvent;
  const canEdit = isAdmin() || isEventManager(id);

  return (
    <BasePage title="Turnaj" loading={eventLoading}>
      <Box gap="medium">
        <Panel title="Detaily turnaja">
          <Box gap="medium">
            <LabelValue label="Program" labelWidth="150px">
              <Anchor label={event?.program.name} href={appPath.program(event?.programId)} />
            </LabelValue>
            <LabelValue label="Názov" labelWidth="150px" value={event?.name} />
            <LabelValue label="Dátum turnaja" labelWidth="150px" value={formatDate(event?.date)} />
            <LabelValue
              label="Termín registrácie"
              labelWidth="150px"
              value={formatDate(event?.registrationEnd)}
            />

            <Box direction="row">
              <Button
                label="Zmeniť"
                onClick={() => setShowEventEditDialog(true)}
                disabled={!canEdit}
              />
            </Box>
          </Box>
        </Panel>
        <Panel title="Registrácie">
          <Box direction="row" wrap>
            {eventData?.getEvent?.teams.map((t) => (
              <Tag key={t.id} onClick={() => setNavLink(appPath.team(t.id))} value={t.name} />
            ))}
          </Box>
        </Panel>
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
      </Box>
      <EditEventDialog
        show={showEventEditDialog}
        event={event}
        onClose={() => setShowEventEditDialog(false)}
        onSubmit={(values) => updateEvent({ variables: { id: id ?? '0', input: { ...values } } })}
      />
    </BasePage>
  );
}
