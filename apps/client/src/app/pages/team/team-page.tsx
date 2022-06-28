import React from 'react';
import { appPath } from '@teams2/common';
import { Box, Button, CheckBox } from 'grommet';
import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppUser } from '../../components/app-user/use-app-user';
import { BasePage } from '../../components/base-page';
import { ErrorPage } from '../../components/error-page';
import { EventList } from '../../components/event-list';
import { LabelValue } from '../../components/label-value';
import { Panel, PanelGroup } from '../../components/panel';
import { UserTags } from '../../components/user-tags';
import {
  CreateTeamInput,
  UpdateTeamInput,
  useAddCoachToTeamMutation,
  useGetTeamQuery,
  useRemoveCoachFromTeamMutation,
  useUpdateTeamMutation,
} from '../../generated/graphql';
import { fullAddress } from '../../utils/format-address';
import { EditTeamDialog } from '../../components/dialogs/edit-team-dialog';

export function TeamPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [showActiveEventsOnly, setShowActiveEventsOnly] = useState(true);
  const [showEditDialog, setShowEditDialog] = useState(false);

  const { isAdmin, isTeamCoach } = useAppUser();

  const {
    data: teamData,
    loading: teamLoading,
    error: teamError,
  } = useGetTeamQuery({ variables: { id: id ?? '0' } });
  const [addCoach] = useAddCoachToTeamMutation();
  const [removeCoach] = useRemoveCoachFromTeamMutation();

  const [updateTeam] = useUpdateTeamMutation();

  const today = useMemo(() => new Date().toISOString().substring(0, 10), []);

  const canEdit = isAdmin() || isTeamCoach(id);
  const team = teamData?.getTeam;

  const events = useMemo(
    () =>
      (team?.events ?? []).filter(
        (et) =>
          !et.event.deletedOn &&
          (!et.event.date ||
            !showActiveEventsOnly ||
            (et.event.date ?? '').substring(0, 10) >= today)
      ),
    [team, showActiveEventsOnly, today]
  );

  const activeEvents = useMemo(
    () =>
      (team?.events ?? []).filter(
        (et) =>
          !et.event.deletedOn && (!et.event.date || (et.event.date ?? '').substring(0, 10) >= today)
      ),
    [team, today]
  );

  const handleSubmit = async (data: Omit<CreateTeamInput, 'email' | 'contactName' | 'phone'>) => {
    console.log('submit', data);
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
          <LabelValue label="Názov" labelWidth="150px" value={team?.name} />
          <LabelValue label="Zriaďovateľ" labelWidth="150px" value={fullAddress(team?.address)} />
          <Box direction="row">
            <Button label="Zmeniť" onClick={() => setShowEditDialog(true)} disabled={!canEdit} />
          </Box>
        </Panel>

        <Panel title="Registrácie" gap="small">
          <Box direction="row" justify="between">
            <Button
              label="Registrovať tím"
              onClick={() => navigate(appPath.register(id))}
              disabled={activeEvents.length > 0}
            />
            <CheckBox
              toggle
              label="Iba aktívne"
              defaultChecked={showActiveEventsOnly}
              onChange={({ target }) => setShowActiveEventsOnly(target.checked)}
            />
          </Box>
          <EventList
            events={[...events.map((e) => e.event)].sort((a, b) =>
              (a.date ?? '') < (b.date ?? '') ? 1 : -1
            )}
          />
        </Panel>

        {canEdit && (
          <Panel title="Tréneri">
            <Box direction="row" wrap>
              <UserTags
                canEdit={canEdit}
                users={team?.coaches ?? []}
                onAdd={(userId) => addCoach({ variables: { teamId: id ?? '0', userId } })}
                onRemove={(userId) => removeCoach({ variables: { teamId: id ?? '0', userId } })}
              />
            </Box>
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
