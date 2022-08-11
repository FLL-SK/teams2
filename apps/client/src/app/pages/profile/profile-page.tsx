import React from 'react';
import { appPath } from '@teams2/common';
import { Box, Button, Text } from 'grommet';
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
  useDeleteUserMutation,
  useGetUserQuery,
  useSetAdminMutation,
  useUndeleteUserMutation,
  useUpdateUserMutation,
} from '../../generated/graphql';
import { EditTeamDialog } from '../../components/dialogs/edit-team-dialog';
import { useAppUser } from '../../components/app-user/use-app-user';
import { LabelValueGroup } from '../../components/label-value-group';
import { EditUserDialog } from '../../components/dialogs/edit-user-dialog';
import { useNotification } from '../../components/notifications/notification-provider';

export function ProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { notify } = useNotification();
  const { isAdmin, isUser, xOut, isSuperAdmin } = useAppUser();
  const { data, loading, refetch, error } = useGetUserQuery({ variables: { id: id ?? '0' } });

  const [showCreateTeamDialog, setShowCreateTeamDialog] = useState(false);
  const [editProfile, setEditProfile] = useState(false);

  const [createTeam] = useCreateTeamMutation({
    onCompleted: () => refetch(),
    onError: (e) => notify.error('Nepodarilo sa vytvoriť tím.', e.message),
  });
  const [setAdmin] = useSetAdminMutation({
    onCompleted: () => refetch(),
    onError: (e) => notify.error('Nepodarilo sa nastaviť admina.', e.message),
  });
  const [updateUser] = useUpdateUserMutation({
    onError: (e) => notify.error('Nepodarilo sa aktualizovať profil.', e.message),
  });
  const [deleteUser] = useDeleteUserMutation({
    onError: (e) => notify.error('Nepodarilo sa deaktivovať účet.', e.message),
  });
  const [undeleteUser] = useUndeleteUserMutation({
    onError: (e) => notify.error('Nepodarilo sa opätovne aktivovať profil.', e.message),
  });

  if (!id || (error && !loading)) {
    return <ErrorPage title="Chyba pr získavaní údajov profilu." />;
  }

  const canEdit = isAdmin() || isUser(id);
  const profile = data?.getUser;
  const isDeleted = !!profile?.deletedOn;

  return (
    <BasePage title="Profil používateľa" loading={loading}>
      <PanelGroup>
        {isDeleted && (
          <Box direction="row" align="center" gap="medium">
            <Text color="status-critical">Profil bol deaktivovaný</Text>
            {isAdmin() && (
              <Button
                size="small"
                primary
                label="Aktivovať profil"
                onClick={() => undeleteUser({ variables: { id: profile?.id ?? '0' } })}
              />
            )}
          </Box>
        )}
        <Panel title="Detaily" gap="small">
          <LabelValueGroup direction="row" labelWidth="200px" gap="medium">
            <LabelValue label="Meno" value={profile?.firstName ?? '-'} />
            <LabelValue label="Priezvisko" value={profile?.lastName ?? '-'} />
            <LabelValue label="Email" value={canEdit ? profile?.username : xOut()} />
            <LabelValue label="Telefón" value={canEdit ? profile?.phone ?? '-' : xOut()} />
            {data?.getUser?.isAdmin && (
              <LabelValue label="Admin" value={profile?.isAdmin ? 'Áno' : 'Nie'} />
            )}
            {data?.getUser?.isSuperAdmin && (
              <LabelValue label="SuperAdmin" value={profile?.isSuperAdmin ? 'Áno' : 'Nie'} />
            )}
          </LabelValueGroup>

          <Box direction="row" gap="small" margin={{ top: 'small' }}>
            {isSuperAdmin() && !profile?.isAdmin && (
              <Button
                label="Pridaj práva admin"
                disabled={isDeleted}
                onClick={() => setAdmin({ variables: { id, isAdmin: true } })}
              />
            )}
            {isAdmin() && profile?.isAdmin && (
              <Button
                label="Zruš práva admin"
                onClick={() => setAdmin({ variables: { id, isAdmin: false } })}
                disabled={!!profile?.isSuperAdmin || isUser(id) || !isSuperAdmin()}
              />
            )}
            {(isAdmin() || isUser(profile?.id ?? '')) && (
              <Button
                label="Upraviť profil"
                onClick={() => setEditProfile(true)}
                disabled={isDeleted}
              />
            )}
            {isAdmin() &&
              !isUser(id) &&
              (!profile?.isSuperAdmin || isSuperAdmin()) &&
              !isDeleted && (
                <Button
                  color="status-critical"
                  label="Deaktivovať profil"
                  onClick={() => deleteUser({ variables: { id: profile?.id ?? '0' } })}
                />
              )}
          </Box>
        </Panel>
        {canEdit && (
          <Panel title="Tímy">
            <Box direction="row" wrap>
              {profile?.coachingTeams
                .filter((t) => !t.deletedOn)
                .map((t) => (
                  <Tag key={t.id} onClick={() => navigate(appPath.team(t.id))} value={t.name} />
                ))}
              <Button
                plain
                icon={<Add />}
                onClick={() => setShowCreateTeamDialog(true)}
                hoverIndicator
                label="Nový"
                margin={{ horizontal: 'small', vertical: 'xsmall' }}
                disabled={isDeleted}
              />
            </Box>
          </Panel>
        )}
        {canEdit && (
          <Panel title="Deaktivované tímy">
            <Box direction="row" wrap>
              {profile?.coachingTeams
                .filter((t) => !!t.deletedOn)
                .map((t) => (
                  <Tag key={t.id} onClick={() => navigate(appPath.team(t.id))} value={t.name} />
                ))}
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
