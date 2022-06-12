import { appPath } from '@teams2/common';
import { Box, Button } from 'grommet';
import { Add } from 'grommet-icons';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { BasePage } from '../../components/base-page';
import { ErrorPage } from '../../components/error-page';
import { LabelValue } from '../../components/label-value';
import { Panel, PanelGroup } from '../../components/panel';
import { Tag } from '../../components/tag';
import { useCreateTeamMutation, useGetUserQuery } from '../../generated/graphql';
import { CreateTeamDialog } from './create-team-dialog';

export function ProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data, loading, refetch, error } = useGetUserQuery({ variables: { id: id ?? '0' } });
  const [showCreateTeamDialog, setShowCreateTeamDialog] = useState(false);
  const [createTeam] = useCreateTeamMutation({ onCompleted: () => refetch() });

  if (!id || error) {
    return <ErrorPage title="Profil nenájdený." />;
  }

  return (
    <BasePage title="Profil používateľa" loading={loading}>
      <PanelGroup>
        <Panel title="Detaily">
          <Box gap="small">
            <LabelValue
              label="Meno"
              value={data?.getUser?.name ?? '-'}
              direction="row"
              labelWidth="100px"
            />
            <LabelValue
              label="Email"
              value={data?.getUser?.username}
              direction="row"
              labelWidth="100px"
            />
            <LabelValue
              label="Telefón"
              value={data?.getUser?.phoneNumber ?? '-'}
              direction="row"
              labelWidth="100px"
            />
          </Box>
        </Panel>
        <Panel title="Tímy">
          <Box direction="row" wrap>
            {data?.getUser?.coachingTeams.map((t) => (
              <Tag key={t.id} onClick={() => navigate(appPath.team(t.id))} value={t.name} />
            ))}
            <Button
              plain
              icon={<Add />}
              onClick={() => setShowCreateTeamDialog(true)}
              hoverIndicator
              label="Nový"
              margin={{ horizontal: 'small', vertical: 'xsmall' }}
            />
          </Box>
        </Panel>
        {!!data?.getUser?.managingEvents.length && (
          <Panel title="Turnaje">
            <Box direction="row" wrap>
              {data?.getUser?.managingEvents.map((e) => (
                <Tag key={e.id} onClick={() => navigate(appPath.event(e.id))} value={e.name} />
              ))}
            </Box>
          </Panel>
        )}
      </PanelGroup>
      <CreateTeamDialog
        show={showCreateTeamDialog}
        onClose={() => setShowCreateTeamDialog(false)}
        onSubmit={(name) => createTeam({ variables: { input: { name } } })}
      />
    </BasePage>
  );
}
