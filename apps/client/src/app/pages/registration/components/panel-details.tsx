import React, { useState } from 'react';
import { appPath } from '@teams2/common';
import { formatDate } from '@teams2/dateutils';
import { Anchor, Box, Button } from 'grommet';
import { LabelValue } from '../../../components/label-value';
import { LabelValueGroup } from '../../../components/label-value-group';
import {
  RegistrationFragmentFragment,
  useCancelEventRegistrationMutation,
  useSwitchTeamEventMutation,
} from '../../../generated/graphql';
import { fullAddress } from '../../../utils/format-address';
import { Panel } from '../../../components/panel';
import { ConfirmTeamUnregisterDialog } from '../../../components/dialogs/confirm-team-unregister';
import { ChangeTeamEventDialog } from '../../../components/dialogs/change-team-event-dialog';
import { useNotification } from '../../../components/notifications/notification-provider';
import { useAppUser } from '../../../components/app-user/use-app-user';
import { FieldConfirmedOn } from '../../registrations/components/field-confirmedOn';

interface PanelRegistrationDetailsProps {
  registration: RegistrationFragmentFragment;
  columnWidth: string;
  readOnly: boolean;
}

export function PanelRegistrationDetails(props: PanelRegistrationDetailsProps) {
  const { registration: reg, columnWidth, readOnly } = props;
  const { notify } = useNotification();
  const { isAdmin, isTeamCoach } = useAppUser();

  const [askUnregisterTeam, setAskUnregisterTeam] = useState(false);
  const [changeEvent, setChangeEvent] = useState(false);

  const [unregisterTeam] = useCancelEventRegistrationMutation({
    onError: () => notify.error('Nepodarilo sa zrušiť registráciu.'),
  });
  const [switchTeamEvent] = useSwitchTeamEventMutation({
    onError: () => notify.error('Nepodarilo sa presunúť tím na iný turnaj'),
  });

  return (
    <Panel title="Detaily registrácie" gap="small">
      <Box wrap direction="row" gap="small">
        <Box width={columnWidth}>
          <LabelValueGroup labelWidth="200px" gap="small" direction="row">
            <LabelValue label="Tím">
              <Anchor label={reg.team.name} href={appPath.team(reg.team.id)} />
            </LabelValue>
            <LabelValue label="Turnaj">
              <Anchor label={reg.event.name} href={appPath.event(reg.event.id)} />
            </LabelValue>
            <LabelValue label="Program">
              <Anchor label={reg.program.name} href={appPath.program(reg.program.id)} />
            </LabelValue>
            <LabelValue label="Zriaďovateľ tímu" value={fullAddress(reg.team.address)} />
          </LabelValueGroup>
        </Box>
        <Box width={columnWidth}>
          <LabelValueGroup labelWidth="200px" gap="small" direction="row">
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
            disabled={
              !isAdmin() && !(isTeamCoach(reg.teamId) && !reg.invoiceIssuedOn && !reg.shippedOn)
            }
          />
          <Button
            label="Zmeniť turnaj"
            onClick={() => setChangeEvent(true)}
            disabled={!isAdmin()}
          />
        </Box>
      )}

      {askUnregisterTeam && (
        <ConfirmTeamUnregisterDialog
          teamName={reg.team.name}
          onClose={() => setAskUnregisterTeam(false)}
          onUnregister={() => unregisterTeam({ variables: { id: reg.id } })}
        />
      )}

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
    </Panel>
  );
}
