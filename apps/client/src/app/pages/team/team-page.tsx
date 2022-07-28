import React, { useCallback } from 'react';
import { appPath } from '@teams2/common';
import { Box, Button, CheckBox, Spinner } from 'grommet';
import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppUser } from '../../components/app-user/use-app-user';
import { BasePage } from '../../components/base-page';
import { ErrorPage } from '../../components/error-page';
import { LabelValue } from '../../components/label-value';
import { Panel, PanelGroup } from '../../components/panel';
import {
  CreateTeamInput,
  UpdateTeamInput,
  useAddTagToTeamMutation,
  useDeleteTagMutation,
  useGetNotesQuery,
  useGetTeamQuery,
  useUpdateTeamMutation,
  useCreateNoteMutation,
} from '../../generated/graphql';
import { fullAddress } from '../../utils/format-address';
import { EditTeamDialog } from '../../components/dialogs/edit-team-dialog';
import { LabelValueGroup } from '../../components/label-value-group';
import { TagList } from '../../components/tag-list';
import { NoteList } from '../../components/note-list';
import { TeamRegistrationsList } from './components/team-registrations';
import { useNotification } from '../../components/notifications/notification-provider';
import { PanelTeamCoaches } from './components/panel-team-coaches';

export function TeamPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [showInactiveEvents, setShowInactiveEvents] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);

  const { isAdmin, isTeamCoach } = useAppUser();

  const { notify } = useNotification();
  const onError = useCallback(() => notify.error('Nepodarilo sa aktualizovať tím.'), [notify]);

  const {
    data: teamData,
    loading: teamLoading,
    error: teamError,
  } = useGetTeamQuery({ variables: { id: id ?? '0' } });

  const {
    data: notesData,
    loading: notesLoading,
    refetch: notesRefetch,
  } = useGetNotesQuery({
    variables: { type: 'team', ref: id ?? '0' },
  });

  const [removeTag] = useDeleteTagMutation({ onError });
  const [addTag] = useAddTagToTeamMutation({ onError });
  const [createNote] = useCreateNoteMutation({ onCompleted: () => notesRefetch(), onError });
  const [updateTeam] = useUpdateTeamMutation({ onError });

  const today = useMemo(() => new Date().toISOString().substring(0, 10), []);

  const canEdit = isAdmin() || isTeamCoach(id);
  const team = teamData?.getTeam;

  const registrations = useMemo(
    () =>
      (team?.registrations ?? []).filter(
        (reg) =>
          !reg.canceledOn &&
          (!reg.event.date ||
            showInactiveEvents ||
            (reg.event.date ?? '').substring(0, 10) >= today)
      ),
    [showInactiveEvents, team?.registrations, today]
  );

  const handleSubmit = async (data: Omit<CreateTeamInput, 'email' | 'contactName' | 'phone'>) => {
    const input: UpdateTeamInput = {
      name: data.name,
      address: {
        name: data.orgName,
        street: data.street,
        city: data.city,
        zip: data.zip,
      },
    };
    updateTeam({ variables: { id: id ?? '0', input } });
  };

  if (!id || teamError) {
    return <ErrorPage title="Chyba pri získavaní dát tímu." />;
  }

  return (
    <BasePage title="Tím" loading={teamLoading}>
      <PanelGroup>
        <Panel title="Detaily tímu" gap="small">
          <LabelValueGroup labelWidth="150px" gap="small" direction="row">
            <LabelValue label="Názov tímu" value={team?.name} />
            <LabelValue label="Zriaďovateľ" value={fullAddress(team?.address)} />
          </LabelValueGroup>
          <Box direction="row">
            <Button label="Zmeniť" onClick={() => setShowEditDialog(true)} disabled={!canEdit} />
          </Box>
        </Panel>

        <Panel title="Registrácie" gap="small">
          <Box direction="row" justify="between">
            <Button
              label="Registrovať tím"
              onClick={() => navigate(appPath.register(id))}
              disabled={registrations.length > 0}
            />
            <CheckBox
              toggle
              label="Zobraziť aj neaktívne"
              defaultChecked={showInactiveEvents}
              onChange={({ target }) => setShowInactiveEvents(target.checked)}
            />
          </Box>
          <TeamRegistrationsList registrations={registrations} />
        </Panel>

        {canEdit && <PanelTeamCoaches team={team} canEdit={canEdit} />}

        {isAdmin() && (
          <Panel title="Štítky">
            <Box direction="row" wrap>
              <TagList
                tags={team?.tags}
                onRemove={(id) => removeTag({ variables: { id } })}
                onAdd={(tag) => addTag({ variables: { teamId: team?.id ?? '0', tagId: tag.id } })}
              />
            </Box>
          </Panel>
        )}
        {isAdmin() && (
          <Panel title="Poznámky">
            {notesLoading ? (
              <Spinner />
            ) : (
              <NoteList
                notes={notesData?.getNotes ?? []}
                limit={20}
                onCreate={(text) =>
                  createNote({ variables: { input: { type: 'team', ref: id, text } } })
                }
              />
            )}
          </Panel>
        )}
      </PanelGroup>
      <EditTeamDialog
        key={team?.id}
        show={showEditDialog}
        team={team}
        onClose={() => setShowEditDialog(false)}
        onSubmit={handleSubmit}
      />
    </BasePage>
  );
}
