import React, { useCallback, useEffect } from 'react';
import { appPath } from '@teams2/common';
import { Box, Button, CheckBox, Spinner, Text } from 'grommet';
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
  useAddTagsToTeamMutation,
  useUpdateTeamMutation,
  useCreateNoteMutation,
  useDeleteTeamMutation,
  useUndeleteTeamMutation,
  useRemoveTagsFromTeamMutation,
  useGetTeamLazyQuery,
  useGetNotesLazyQuery,
} from '../../_generated/graphql';
import { fullAddress } from '../../utils/format-address';
import { EditTeamDialog } from '../../components/dialogs/edit-team-dialog';
import { LabelValueGroup } from '../../components/label-value-group';
import { TagList } from '../../components/tag-list';
import { NoteList } from '../../components/note-list';
import { TeamRegistrationsList } from './components/team-registrations';
import { useNotification } from '../../components/notifications/notification-provider';
import { PanelTeamCoaches } from './components/panel-team-coaches';
import { testingLibraryReactVersion } from '@nx/react/src/utils/versions';

export function TeamPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [showInactiveRegistrations, setShowInactiveRegistrations] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);

  const { isAdmin, isTeamCoach } = useAppUser();

  const { notify } = useNotification();
  const onError = useCallback(() => notify.error('Nepodarilo sa aktualizovať tím.'), [notify]);

  const [fetchTeam, { data: teamData, loading: teamLoading, error: teamError }] =
    useGetTeamLazyQuery({ fetchPolicy: 'cache-and-network' });

  const [fetchNotes, { data: notesData, loading: notesLoading, refetch: notesRefetch }] =
    useGetNotesLazyQuery({ fetchPolicy: 'cache-and-network' });

  const [removeTag] = useRemoveTagsFromTeamMutation({ onError });
  const [addTag] = useAddTagsToTeamMutation({ onError });

  const [createNote] = useCreateNoteMutation({ onCompleted: () => notesRefetch(), onError });

  const [updateTeam] = useUpdateTeamMutation({ onError });
  const [deleteTeam] = useDeleteTeamMutation({ onError });
  const [undeleteTeam] = useUndeleteTeamMutation({ onError });

  useEffect(() => {
    if (id) {
      fetchTeam({ variables: { id } });
      fetchNotes({
        variables: { type: 'team', ref: id },
      });
    }
  }, [id, fetchTeam, fetchNotes]);

  const canEdit = isAdmin() || isTeamCoach(id);
  const team = teamData?.getTeam;
  const registrations = team?.registrations ?? [];

  const handleSubmit = async (data: Omit<CreateTeamInput, 'email' | 'contactName' | 'phone'>) => {
    if (!id) {
      return;
    }

    const input: UpdateTeamInput = {
      name: data.name,
      address: {
        name: data.orgName,
        street: data.street,
        city: data.city,
        zip: data.zip,
      },
    };
    updateTeam({ variables: { id, input } });
  };

  if (!id || teamError) {
    return <ErrorPage title="Chyba pri získavaní dát tímu." />;
  }

  const isDeleted = !!team?.deletedOn;

  return (
    <BasePage title="Tím">
      {teamLoading || !team ? (
        <Spinner />
      ) : (
        <>
          <PanelGroup>
            {isDeleted && (
              <Box direction="row" gap="medium" align="center">
                <Text color="status-error">Tím bol deaktivovaný.</Text>
                {isAdmin() && (
                  <Button
                    size="small"
                    primary
                    label="Aktivovať tím"
                    onClick={() => undeleteTeam({ variables: { id } })}
                  />
                )}
              </Box>
            )}

            <Panel title="Detaily tímu" gap="small">
              <LabelValueGroup labelWidth="150px" gap="small" direction="row">
                <LabelValue label="Názov tímu" value={team.name} />
                <LabelValue label="Zriaďovateľ" value={fullAddress(team.address)} />
              </LabelValueGroup>
              <Box direction="row" gap="small">
                <Button
                  label="Zmeniť"
                  onClick={() => setShowEditDialog(true)}
                  disabled={!canEdit || isDeleted}
                />
                {(isAdmin() || isTeamCoach(id)) && !isDeleted && (
                  <Button
                    label="Deaktivovať tím"
                    color="status-critical"
                    onClick={() => deleteTeam({ variables: { id } })}
                    disabled={registrations.length > 0}
                  />
                )}
              </Box>
            </Panel>

            <Panel title="Registrácie" gap="small">
              <Box direction="row" justify="between">
                <Button
                  label="Registrovať tím do programu"
                  onClick={() => navigate(appPath.registerProgram(id))}
                  disabled={isDeleted}
                />
                <CheckBox
                  toggle
                  label="Zobraziť aj neaktívne"
                  defaultChecked={showInactiveRegistrations}
                  onChange={({ target }) => setShowInactiveRegistrations(target.checked)}
                />
              </Box>
              <TeamRegistrationsList
                registrations={registrations}
                includeInactive={showInactiveRegistrations}
              />
            </Panel>

            {canEdit && <PanelTeamCoaches team={team} canEdit={canEdit && !isDeleted} />}

            {isAdmin() && (
              <Panel title="Štítky">
                <Box direction="row" wrap>
                  <TagList
                    tags={team.tags}
                    onRemove={(tagId) => removeTag({ variables: { teamId: id, tagIds: [tagId] } })}
                    onAdd={(tag) => addTag({ variables: { teamId: id, tagIds: [tag.id] } })}
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
            key={id}
            show={showEditDialog}
            team={team}
            onClose={() => setShowEditDialog(false)}
            onSubmit={handleSubmit}
          />
        </>
      )}
    </BasePage>
  );
}
