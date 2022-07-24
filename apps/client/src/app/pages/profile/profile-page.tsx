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
  useUpdateUserMutation,
} from '../../generated/graphql';
import { EditTeamDialog } from '../../components/dialogs/edit-team-dialog';
import { useAppUser } from '../../components/app-user/use-app-user';
import { LabelValueGroup } from '../../components/label-value-group';
import { EditUserDialog } from '../../components/dialogs/edit-user-dialog';

export function ProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAdmin, isUser, xOut, isSuperAdmin } = useAppUser();
  const { data, loading, refetch, error } = useGetUserQuery({ variables: { id: id ?? '0' } });

  const [showCreateTeamDialog, setShowCreateTeamDialog] = useState(false);
  const [editProfile, setEditProfile] = useState(false);

  const [createTeam] = useCreateTeamMutation({ onCompleted: () => refetch() });
  const [setAdmin] = useSetAdminMutation({ onCompleted: () => refetch() });
  const [updateUser] = useUpdateUserMutation();

  if (!id || (error && !loading)) {
    return <ErrorPage title="Profil nenájdený." />;
  }

  const canEdit = isAdmin() || isUser(id);
  const profile = data?.getUser;

  return (
    <BasePage title="Profil používateľa" loading={loading}>
      <PanelGroup>
        <Panel title="Detaily" gap="small">
          <LabelValueGroup direction="row" labelWidth="200px" gap="medium">
            <LabelValue label="Meno" value={profile?.name ?? '-'} />
            <LabelValue label="Email" value={canEdit ? profile?.username : xOut()} />
            <LabelValue label="Telefón" value={canEdit ? profile?.phone ?? '-' : xOut()} />
            {data?.getUser?.isAdmin && (
              <LabelValue label="Admin" value={profile?.isAdmin ? 'Áno' : 'Nie'} />
            )}
            {data?.getUser?.isSuperAdmin && (
              <LabelValue label="SuperAdmin" value={profile?.isSuperAdmin ? 'Áno' : 'Nie'} />
            )}
          </LabelValueGroup>

          <Box direction="row" gap="small">
            {isSuperAdmin() && !profile?.isAdmin && (
              <Button
                label="Pridaj práva admin"
                onClick={() => setAdmin({ variables: { id, isAdmin: true } })}
              />
            )}
            {isAdmin() && profile?.isAdmin && (
              <Button
                label="Zruš práva admin"
                onClick={() => setAdmin({ variables: { id, isAdmin: false } })}
              />
            )}
            {(isAdmin() || isUser(profile?.id ?? '')) && (
              <Button label="Upraviť profil" onClick={() => setEditProfile(true)} />
            )}
          </Box>
        </Panel>
        {canEdit && (
          <Panel title="Tímy">
            <Box direction="row" wrap>
              {profile?.coachingTeams.map((t) => (
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
        {!!profile?.managingEvents.length && canEdit && (
          <Panel title="Turnaje">
            <Box direction="row" wrap>
              {profile?.managingEvents.map((e) => (
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
      <EditUserDialog
        user={profile}
        show={editProfile}
        onClose={() => setEditProfile(false)}
        onSubmit={(data) => updateUser({ variables: { id: profile?.id ?? '0', input: data } })}
      />
    </BasePage>
  );
}
