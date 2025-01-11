import React, { useState } from 'react';
import { appPath } from '@teams2/common';
import { formatDate } from '@teams2/dateutils';
import { Anchor, Box, Button } from 'grommet';
import { LabelValue } from '../../../components/label-value';
import { LabelValueGroup } from '../../../components/label-value-group';
import {
  RegistrationFragmentFragment,
  useCancelRegistrationMutation,
  useChangeRegisteredEventMutation,
  useUpdateRegistrationMutation,
} from '../../../_generated/graphql';
import { fullAddress } from '../../../utils/format-address';
import { Panel } from '../../../components/panel';
import { ConfirmTeamUnregisterDialog } from '../../../components/dialogs/confirm-team-unregister';
import { ChangeTeamEventDialog } from '../../../components/dialogs/change-team-event-dialog';
import { useNotification } from '../../../components/notifications/notification-provider';
import { useAppUser } from '../../../components/app-user/use-app-user';
import { FieldConfirmedOn } from '../../registrations/components/field-confirmedOn';
import { EditRegistrationTypeDialog } from '../../../components/dialogs/edit-registration-type-dialog';
import { set } from 'lodash';
import { on } from 'events';

interface PanelRegistrationDetailsProps {
  registration: RegistrationFragmentFragment;
  columnWidth: string;
  readOnly: boolean;
}

export function PanelRegistrationDetails(props: PanelRegistrationDetailsProps) {
  const { registration: reg, columnWidth, readOnly } = props;
  const { notify } = useNotification();
  const { isAdmin, isTeamCoach, isEventManager, isProgramManager } = useAppUser();

  const [askUnregisterTeam, setAskUnregisterTeam] = useState(false);
  const [changeEvent, setChangeEvent] = useState(false);
  const [changeRegType, setChangeRegType] = useState(false);

  const [unregisterTeam] = useCancelRegistrationMutation({
    onError: () => notify.error('Nepodarilo sa zrušiť registráciu.'),
  });
  const [switchTeamEvent] = useChangeRegisteredEventMutation({
    onError: () => notify.error('Nepodarilo sa presunúť tím na iný turnaj'),
  });
  const [updateRegistration] = useUpdateRegistrationMutation({
    onError: () => notify.error('Nepodarilo sa zmeniť typ registrácie'),
  });

  const canCancelReg =
    isAdmin() ||
    (isTeamCoach(reg.teamId) && !reg.confirmedOn) ||
    isProgramManager(reg.programId) ||
    isEventManager(reg.eventId);

  return (
    <Panel title="Detaily registrácie" gap="small">
      <Box wrap direction="row" gap="small">
        <Box width={columnWidth}>
          <LabelValueGroup labelWidth="200px" gap="small" direction="row">
            <LabelValue label="Tím">
              <Anchor label={reg.team.name} href={appPath.team(reg.team.id)} />
            </LabelValue>
            {reg.event && (
              <LabelValue label="Turnaj">
                <Anchor label={reg.event.name} href={appPath.event(reg.event.id)} />
              </LabelValue>
            )}
            <LabelValue label="Program">
              <Anchor label={reg.program.name} href={appPath.program(reg.program.id)} />
            </LabelValue>
            <LabelValue label="Zriaďovateľ tímu" value={fullAddress(reg.team.address)} />
          </LabelValueGroup>
        </Box>
        <Box width={columnWidth}>
          <LabelValueGroup labelWidth="200px" gap="small" direction="row">
            {!reg.event && <LabelValue label="Číslo tímu" value={reg.teamNo ?? 'xxx'} />}
            {!reg.event && (
              <LabelValue
                label="Typ"
                value={
                  `${reg.type}` +
                  (reg.type === 'CLASS_PACK'
                    ? ` - T:${reg.impactedTeamCount} - D:${reg.impactedChildrenCount} - S:${reg.setCount}`
                    : '')
                }
              />
            )}
            <LabelValue label="Dátum registrácie" value={formatDate(reg.createdOn)} />
            <FieldConfirmedOn registration={reg} readOnly={readOnly} />
          </LabelValueGroup>
        </Box>
      </Box>
      {!reg.canceledOn && !readOnly && (
        <Box direction="row" gap="small">
          <Button
            label="Zrušiť registráciu"
            onClick={() => setAskUnregisterTeam(true)}
            disabled={!canCancelReg}
          />
          {reg.event && (
            <Button
              label="Zmeniť turnaj"
              onClick={() => setChangeEvent(true)}
              disabled={!(isAdmin() || isProgramManager(reg.programId))}
            />
          )}

          <Button label="Zmeniť typ" onClick={() => setChangeRegType(true)} disabled={!isAdmin()} />
        </Box>
      )}

      {askUnregisterTeam && (
        <ConfirmTeamUnregisterDialog
          type={reg.event ? 'EVENT' : 'PROGRAM'}
          teamName={reg.team.name}
          onClose={() => setAskUnregisterTeam(false)}
          onUnregister={() => unregisterTeam({ variables: { id: reg.id } })}
        />
      )}

      {changeRegType && (
        <EditRegistrationTypeDialog
          show={changeRegType}
          regTypeData={{
            type: reg.type,
            teams: reg.impactedTeamCount,
            children: reg.impactedChildrenCount,
            setCount: reg.setCount,
          }}
          onClose={() => setChangeRegType(false)}
          onSubmit={async (e) =>
            await updateRegistration({
              variables: {
                id: reg.id,
                input: {
                  type: e.type,
                  impactedTeamCount: e.teams,
                  impactedChildrenCount: e.children,
                  setCount: e.setCount,
                },
              },
            })
          }
        />
      )}

      {reg.event && (
        <ChangeTeamEventDialog
          show={changeEvent}
          team={reg.team}
          event={reg.event}
          onClose={() => setChangeEvent(false)}
          onSubmit={(e) =>
            switchTeamEvent({
              variables: {
                registrationId: reg.id,
                newEventId: e.id,
              },
            })
          }
        />
      )}
    </Panel>
  );
}
