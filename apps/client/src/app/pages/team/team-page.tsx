import { appPath } from '@teams2/common';
import { Box, Button, Tag } from 'grommet';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppUser } from '../../components/app-user/use-app-user';
import { BasePage } from '../../components/base-page';
import { LabelValue } from '../../components/label-value';
import { Panel, PanelGroup } from '../../components/panel';
import { UserTags } from '../../components/user-tags';
import {
  useAddCoachToTeamMutation,
  useGetTeamLazyQuery,
  useRemoveCoachFromTeamMutation,
} from '../../generated/graphql';
import { RegisterTeamDialog } from './register-team';

export function TeamPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [navLink, setNavLink] = useState<string>();
  const [showRegisterTeamDialog, setShowRegisterTeamDialog] = useState(false);

  const { isAdmin, isTeamCoach } = useAppUser();

  const [getTeam, { data: teamData, loading: teamLoading, error: teamError }] =
    useGetTeamLazyQuery();
  const [addCoach] = useAddCoachToTeamMutation();
  const [removeCoach] = useRemoveCoachFromTeamMutation();

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

  const canEdit = isAdmin() || isTeamCoach(id);

  return (
    <BasePage title="Tím" loading={teamLoading}>
      <PanelGroup>
        <Panel title="Detaily tímu">
          <LabelValue label="Názov" value={teamData?.getTeam?.name} />
        </Panel>
        <Panel title="Registrácie">
          <Button label="Registrácia" onClick={() => setShowRegisterTeamDialog(true)} />
          <Box direction="row" wrap>
            {teamData?.getTeam?.events.map((e) => (
              <Tag key={e.id} onClick={() => setNavLink(appPath.event(e.id))} value={e.name} />
            ))}
          </Box>
        </Panel>
        <Panel title="Faktúry">
          <p>Here be data</p>
        </Panel>
        <Panel title="Tréneri">
          <Box direction="row" wrap>
            <UserTags
              canEdit={canEdit}
              users={teamData?.getTeam?.coaches ?? []}
              onAdd={(userId) => addCoach({ variables: { teamId: id ?? '0', userId } })}
              onRemove={(userId) => removeCoach({ variables: { teamId: id ?? '0', userId } })}
            />
          </Box>
        </Panel>
      </PanelGroup>
      <RegisterTeamDialog
        show={showRegisterTeamDialog}
        onClose={() => setShowRegisterTeamDialog(false)}
      />
    </BasePage>
  );
}
