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
  useAddCoachToTeamMutation,
  useGetTeamQuery,
  useRemoveCoachFromTeamMutation,
} from '../../generated/graphql';

export function TeamPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [showActiveEventsOnly, setShowActiveEventsOnly] = useState(true);

  const { isAdmin, isTeamCoach } = useAppUser();

  const {
    data: teamData,
    loading: teamLoading,
    error: teamError,
  } = useGetTeamQuery({ variables: { id: id ?? '0' } });
  const [addCoach] = useAddCoachToTeamMutation();
  const [removeCoach] = useRemoveCoachFromTeamMutation();

  const today = useMemo(() => new Date().toISOString().substring(0, 10), []);

  const canEdit = isAdmin() || isTeamCoach(id);
  const team = teamData?.getTeam;

  const events = useMemo(
    () =>
      (team?.events ?? []).filter(
        (event) =>
          !event.deletedOn &&
          (!event.date || !showActiveEventsOnly || (event.date ?? '').substring(0, 10) >= today)
      ),
    [team, showActiveEventsOnly, today]
  );

  const activeEvents = useMemo(
    () =>
      (team?.events ?? []).filter(
        (event) => !event.deletedOn && (!event.date || (event.date ?? '').substring(0, 10) >= today)
      ),
    [team, today]
  );

  if (!id || teamError) {
    return <ErrorPage title="Chyba pri získavaní dát tímu." />;
  }

  return (
    <BasePage title="Tím" loading={teamLoading}>
      <PanelGroup>
        <Panel title="Detaily tímu">
          <LabelValue label="Názov" labelWidth="150px" value={team?.name} />
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
          <EventList events={events} />
        </Panel>
        <Panel title="Faktúry">
          <p>Here be data</p>
        </Panel>
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
      </PanelGroup>
    </BasePage>
  );
}
