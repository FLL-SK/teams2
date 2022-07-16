import React from 'react';
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
import {
  useCreateTeamMutation,
  useGetUserQuery,
  useSetAdminMutation,
} from '../../generated/graphql';
import { EditTeamDialog } from '../../components/dialogs/edit-team-dialog';
import { useAppUser } from '../../components/app-user/use-app-user';
import { LabelValueGroup } from '../../components/label-value-group';

export function ProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAdmin, isUser, xOut, isSuperAdmin } = useAppUser();
  const { data, loading, refetch, error } = useGetUserQuery({ variables: { id: id ?? '0' } });
  const [showCreateTeamDialog, setShowCreateTeamDialog] = useState(false);

  const [createTeam] = useCreateTeamMutation({ onCompleted: () => refetch() });
  const [setAdmin] = useSetAdminMutation({ onCompleted: () => refetch() });

  if (!id || error) {
    return <ErrorPage title="Profil nenájdený." />;
  }

  const canEdit = isAdmin() || isUser(id);

  return (
    <BasePage title="Profil používateľa" loading={loading}>
      <PanelGroup>
        <Panel title="Detaily" gap="small">
          <LabelValueGroup direction="row" labelWidth="100px" gap="medium">
            <LabelValue label="Meno" value={data?.getUser?.name ?? '-'} />
            <LabelValue label="Email" value={canEdit ? data?.getUser?.username : xOut()} />
            <LabelValue label="Telefón" value={canEdit ? data?.getUser?.phone ?? '-' : xOut()} />
            {data?.getUser?.isAdmin && (
              <LabelValue label="Admin" value={data?.getUser?.isAdmin ? 'Áno' : 'Nie'} />
            )}
            {data?.getUser?.isSuperAdmin && (
              <LabelValue label="SuperAdmin" value={data?.getUser?.isSuperAdmin ? 'Áno' : 'Nie'} />
            )}
          </LabelValueGroup>

          {isSuperAdmin() && !data?.getUser?.isAdmin && (
            <Box>
              <Button
                label="Urob admin"
                onClick={() => setAdmin({ variables: { id, isAdmin: true } })}
              />
            </Box>
          )}
        </Panel>
        {canEdit && (
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
        )}
        {!!data?.getUser?.managingEvents.length && canEdit && (
          <Panel title="Turnaje">
            <Box direction="row" wrap>
              {data?.getUser?.managingEvents.map((e) => (
                <Tag key={e.id} onClick={() => navigate(appPath.event(e.id))} value={e.name} />
              ))}
            </Box>
          </Panel>
        )}
      </PanelGroup>
      <EditTeamDialog
        show={showCreateTeamDialog}
        onClose={() => setShowCreateTeamDialog(false)}
        onSubmit={(data) => createTeam({ variables: { input: data } })}
      />
    </BasePage>
  );
}
