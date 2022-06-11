import { appPath } from '@teams2/common';
import { Box, Button, CheckBox, Tag } from 'grommet';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppUser } from '../../components/app-user/use-app-user';
import { BasePage } from '../../components/base-page';
import { EventsList } from '../../components/events-list';
import { LabelValue } from '../../components/label-value';
import { Panel, PanelGroup } from '../../components/panel';
import { UserTags } from '../../components/user-tags';
import {
  EventListFragmentFragment,
  useAddCoachToTeamMutation,
  useGetTeamLazyQuery,
  useRegisterTeamForEventMutation,
  useRemoveCoachFromTeamMutation,
} from '../../generated/graphql';
import { RegisterTeamDialog } from './register-team';

export function TeamPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [navLink, setNavLink] = useState<string>();
  const [showRegisterTeamDialog, setShowRegisterTeamDialog] = useState(false);
  const [showInactiveEvents, setShowInactiveEvents] = useState(false);

  const { isAdmin, isTeamCoach } = useAppUser();

  const [
    getTeam,
    { data: teamData, loading: teamLoading, error: teamError, refetch: refetchTeam },
  ] = useGetTeamLazyQuery();
  const [addCoach] = useAddCoachToTeamMutation();
  const [removeCoach] = useRemoveCoachFromTeamMutation();
  const [registerTeam] = useRegisterTeamForEventMutation({ onCompleted: () => refetchTeam() });

  useEffect(() => {
    if (id) {
      getTeam({ variables: { id } });
    }
  }, [getTeam, id]);

  useEffect(() => {
    if (navLink) {
      navigate(navLink);
    }
    return () => {
      setNavLink(undefined);
    };
  }, [navLink, navigate]);

  if (!id || teamError) {
    if (!navLink) {
      setNavLink(appPath.page404);
    }
  }

  const today = useMemo(() => new Date().toISOString().substring(0, 10), []);

  const canEdit = isAdmin() || isTeamCoach(id);
  const team = teamData?.getTeam;
  const events = useMemo(
    () =>
      (team?.events ?? []).filter(
        (event) =>
          !event.deletedOn &&
          (!event.date || showInactiveEvents || (event.date ?? '').substring(0, 10) >= today)
      ),
    [team, showInactiveEvents, today]
  );
  const activeEvents = useMemo(
    () =>
      (team?.events ?? []).filter(
        (event) => !event.deletedOn && (!event.date || (event.date ?? '').substring(0, 10) >= today)
      ),
    [team, today]
  );

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
              onClick={() => setShowRegisterTeamDialog(true)}
              disabled={activeEvents.length > 0}
            />
            <CheckBox
              toggle
              label="Zobraziť aj neaktívne"
              defaultChecked={showInactiveEvents}
              onChange={({ target }) => setShowInactiveEvents(target.checked)}
            />
          </Box>
          <EventsList events={events} />
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
      <RegisterTeamDialog
        show={showRegisterTeamDialog}
        onClose={() => setShowRegisterTeamDialog(false)}
        onSubmit={(eventId) => registerTeam({ variables: { teamId: id ?? '0', eventId } })}
      />
    </BasePage>
  );
}
