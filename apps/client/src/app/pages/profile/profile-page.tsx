import { appPath } from '@teams2/common';
import { Box, Button, Spinner, Tag } from 'grommet';
import { Add } from 'grommet-icons';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { BasePage } from '../../components/base-page';
import { Panel } from '../../components/panel';
import { useCreateTeamMutation, useGetUserLazyQuery } from '../../generated/graphql';
import { CreateTeamDialog } from './create-team-dialog';

export function ProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [getProfile, { data, loading, refetch }] = useGetUserLazyQuery();
  const [showCreateTeamDialog, setShowCreateTeamDialog] = useState(false);
  const [createTeam] = useCreateTeamMutation({ onCompleted: () => refetch() });

  useEffect(() => {
    if (id) {
      getProfile({ variables: { id } });
    }
  }, [getProfile, id]);

  if (loading) {
    return <Spinner />;
  } else {
    if (!id || !data?.getUser) {
      navigate(appPath.page404);
    }
  }

  return (
    <BasePage title="Profil">
      <Box gap="medium">
        <Panel title="Detaily používateľa">
          <p>{data?.getUser?.name}</p>
          <p>{data?.getUser?.username}</p>
        </Panel>
        <Panel title="Moje tímy">
          <Box direction="row" wrap>
            {data?.getUser?.coachingTeams.map((t) => (
              <Tag key={t.id} onClick={() => navigate(appPath.team(t.id))} value={t.name} />
            ))}
            <Button icon={<Add />} onClick={() => setShowCreateTeamDialog(true)} hoverIndicator />
          </Box>
        </Panel>
        {!!data?.getUser?.managingEvents.length && (
          <Panel title="Moje turnaje">
            <Box direction="row" wrap>
              {data?.getUser?.managingEvents.map((e) => (
                <Tag key={e.id} onClick={() => navigate(appPath.event(e.id))} value={e.name} />
              ))}
            </Box>
          </Panel>
        )}
      </Box>
      <CreateTeamDialog
        show={showCreateTeamDialog}
        onClose={() => setShowCreateTeamDialog(false)}
        onSubmit={(name) => createTeam({ variables: { input: { name } } })}
      />
    </BasePage>
  );
}
