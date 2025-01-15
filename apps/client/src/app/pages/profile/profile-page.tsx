import React, { useMemo } from 'react';
import { appPath } from '@teams2/common';
import { Box, Button, Spinner, Text } from 'grommet';
import { Add } from 'grommet-icons';
import { useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { BasePage } from '../../components/base-page';
import { ErrorPage } from '../../components/error-page';
import { LabelValue } from '../../components/label-value';
import { Panel, PanelGroup } from '../../components/panel';
import { Tag } from '../../components/tag';
import {
  UpdateUserInput,
  useCreateTeamMutation,
  useDeleteUserMutation,
  useGetUserProfileLazyQuery,
  useSetAdminMutation,
  useUndeleteUserMutation,
  useUpdateUserMutation,
} from '../../_generated/graphql';
import { EditTeamDialog } from '../../components/dialogs/edit-team-dialog';
import { useAppUser } from '../../components/app-user/use-app-user';
import { LabelValueGroup } from '../../components/label-value-group';
import { EditUserDialog } from '../../components/dialogs/edit-user-dialog';
import { useNotification } from '../../components/notifications/notification-provider';
import { isNil, omitBy } from 'lodash';
import { formatDate } from '@teams2/dateutils';
import { ListRow2 } from '../../components/list-row';

export function ProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { notify } = useNotification();
  const { isAdmin, isUser, xOut, isSuperAdmin, user } = useAppUser();
  const [fetchUser, { data, loading, refetch, error }] = useGetUserProfileLazyQuery({
    onError: (e) => notify.error('Nepodarilo sa načítať profil.', e.message),
  });

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

  React.useEffect(() => {
    if (id) {
      fetchUser({ variables: { id } });
    }
  }, [id, fetchUser]);

  const teamData = useMemo(() => {
    const td = (data?.getUser?.coachingTeams ?? [])
      .filter((t) => !t.deletedOn)
      .map((t) => {
        return {
          ...t,
          registrations: t.registrations.filter(
            (r) =>
              !r.canceledOn &&
              (r.event
                ? !r.event.date || new Date(r.event.date) > new Date()
                : !r.program.endDate || new Date(r.program.endDate) > new Date()),
          ),
          hasFiles: t.registrations.some((r) => r.files.length > 0),
        };
      });
    return td;
  }, [data?.getUser?.coachingTeams]);

  if (!id && user?.id) {
    return <Navigate to={appPath.profile(user?.id)} />;
  }
  if (!id || (error && !loading)) {
    return <ErrorPage title="Chyba pr získavaní údajov profilu." />;
  }

  const canEdit = isAdmin() || isUser(id);
  const profile = data?.getUser;
  const isDeleted = !!profile?.deletedOn;

  return (
    <BasePage title="Profil používateľa">
      {loading || !profile ? (
        <Spinner />
      ) : (
        <>
          <PanelGroup>
            {isDeleted && (
              <Box direction="row" align="center" gap="medium">
                <Text color="status-critical">Profil bol deaktivovaný</Text>
                {isAdmin() && (
                  <Button
                    size="small"
                    primary
                    label="Aktivovať profil"
                    onClick={() => undeleteUser({ variables: { id: profile.id } })}
                  />
                )}
              </Box>
            )}
            <Panel title="Detaily" gap="small">
              <LabelValueGroup direction="row" labelWidth="200px" gap="medium">
                <LabelValue label="Meno" value={profile.firstName ?? '-'} />
                <LabelValue label="Priezvisko" value={profile.lastName ?? '-'} />
                <LabelValue label="Email" value={canEdit ? profile.username : xOut()} />
                <LabelValue label="Telefón" value={canEdit ? (profile.phone ?? '-') : xOut()} />
                {isAdmin() && (
                  <LabelValue
                    label="Súhlas GDPR"
                    value={
                      canEdit
                        ? profile.gdprAcceptedOn
                          ? formatDate(profile.gdprAcceptedOn)
                          : '-'
                        : xOut()
                    }
                  />
                )}
                {profile.isAdmin && (
                  <LabelValue label="Admin" value={profile.isAdmin ? 'Áno' : 'Nie'} />
                )}
                {profile.isSuperAdmin && (
                  <LabelValue label="SuperAdmin" value={profile.isSuperAdmin ? 'Áno' : 'Nie'} />
                )}
              </LabelValueGroup>

              <Box direction="row" gap="small" margin={{ top: 'small' }}>
                {isSuperAdmin() && !profile.isAdmin && (
                  <Button
                    label="Pridaj práva admin"
                    disabled={isDeleted}
                    onClick={() => setAdmin({ variables: { id, isAdmin: true } })}
                  />
                )}
                {isAdmin() && profile.isAdmin && (
                  <Button
                    label="Zruš práva admin"
                    onClick={() => setAdmin({ variables: { id, isAdmin: false } })}
                    disabled={!!profile.isSuperAdmin || isUser(id) || !isSuperAdmin()}
                  />
                )}
                {(isAdmin() || isUser(profile.id)) && (
                  <Button
                    label="Upraviť profil"
                    onClick={() => setEditProfile(true)}
                    disabled={isDeleted}
                  />
                )}
                {isAdmin() &&
                  !isUser(id) &&
                  (!profile.isSuperAdmin || isSuperAdmin()) &&
                  !isDeleted && (
                    <Button
                      color="status-critical"
                      label="Deaktivovať profil"
                      onClick={() => deleteUser({ variables: { id: profile.id } })}
                    />
                  )}
              </Box>
            </Panel>
            {canEdit && (
              <Panel title="Manažované tímy">
                <Box gap="medium">
                  {teamData.map((t) => (
                    <ListRow2
                      key={t.id}
                      columns="1fr 150px 150px"
                      onClick={() => navigate(appPath.team(t.id))}
                      align="center"
                      height="50px"
                      pad={{ horizontal: 'small' }}
                    >
                      <Text>{t.name}</Text>
                      <Text>{t.registrations.length > 0 ? 'Má aktívne registrácie' : ''}</Text>
                      <Text>{t.hasFiles ? 'Súbory na stiahnutie' : ''}</Text>
                    </ListRow2>
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
                  {profile.coachingTeams
                    .filter((t) => !!t.deletedOn)
                    .map((t) => (
                      <Tag key={t.id} onClick={() => navigate(appPath.team(t.id))} value={t.name} />
                    ))}
                </Box>
              </Panel>
            )}

            {!!profile.managingEvents.length && canEdit && (
              <Panel title="Manažované turnaje">
                <Box direction="row" wrap>
                  {profile.managingEvents.map((e) => (
                    <Tag key={e.id} onClick={() => navigate(appPath.event(e.id))} value={e.name} />
                  ))}
                </Box>
              </Panel>
            )}
            {!!profile.managingPrograms.length && canEdit && (
              <Panel title="Manažované programy">
                <Box direction="row" wrap>
                  {profile.managingPrograms.map((e) => (
                    <Tag
                      key={e.id}
                      onClick={() => navigate(appPath.program(e.id))}
                      value={e.name}
                    />
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
            onSubmit={(data) => {
              const input: UpdateUserInput = {
                firstName: data.firstName,
                lastName: data.lastName,
                phone: data.phone,
                username: data.username,
                usernameOverride: data.usernameOverride,
                gdprAccepted: data.gdprAccepted,
              };
              return updateUser({ variables: { id: profile.id, input: omitBy(input, isNil) } });
            }}
            requestGdprConsent={!profile?.gdprAcceptedOn}
          />
        </>
      )}
    </BasePage>
  );
}
