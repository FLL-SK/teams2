import React, { useState } from 'react';
import { appPath } from '@teams2/common';
import { formatDate } from '@teams2/dateutils';
import { Anchor, Box, Button, Text } from 'grommet';
import { LabelValue } from '../../../components/label-value';
import { LabelValueGroup } from '../../../components/label-value-group';
import {
  RegistrationFragmentFragment,
  useUnregisterTeamFromEventMutation,
} from '../../../generated/graphql';
import { fullAddress } from '../../../utils/format-address';
import { Panel } from '../../../components/panel';
import { formatFullName } from '../../../utils/format-fullname';
import { ConfirmTeamUnregisterDialog } from '../../../components/dialogs/confirm-team-unregister';

interface PanelRegistrationDetailsProps {
  registration: RegistrationFragmentFragment;
  columnWidth: string;
}

export function PanelRegistrationDetails(props: PanelRegistrationDetailsProps) {
  const { registration: reg, columnWidth } = props;
  const [askUnregisterTeam, setAskUnregisterTeam] = useState(false);

  const [unregisterTeam] = useUnregisterTeamFromEventMutation();

  return (
    <Panel title="Detaily registrácie" gap="small">
      <Box wrap direction="row" gap="small">
        <Box width={columnWidth}>
          <LabelValueGroup labelWidth="150px" gap="small" direction="row">
            <LabelValue label="Program">
              <Anchor label={reg.program.name} href={appPath.program(reg.program.id)} />
            </LabelValue>
            <LabelValue label="Turnaj">
              <Anchor label={reg.event.name} href={appPath.event(reg.event.id)} />
            </LabelValue>
            <LabelValue label="Tím">
              <Anchor label={reg.team.name} href={appPath.team(reg.team.id)} />
            </LabelValue>
            <LabelValue label="Zriaďovateľ tímu" value={fullAddress(reg.team.address)} />
            <LabelValue label="Dátum registrácie" value={formatDate(reg.createdOn)} />
          </LabelValueGroup>
        </Box>
        <Box width={columnWidth}>
          <LabelValueGroup labelWidth="300px" gap="small">
            {reg.team.coaches
              .filter((coach) => !coach.deletedOn)
              .map((coach) => (
                <LabelValue label={formatFullName(coach.firstName, coach.lastName)} key={coach.id}>
                  <Text>{coach.username}</Text>
                  <Text>{coach.phone}</Text>
                </LabelValue>
              ))}
          </LabelValueGroup>
        </Box>
      </Box>
      <Box direction="row">
        <Button label="Zrušiť registráciu" onClick={() => setAskUnregisterTeam(true)} />
      </Box>

      {askUnregisterTeam && (
        <ConfirmTeamUnregisterDialog
          teamName={reg.team.name}
          onClose={() => setAskUnregisterTeam(false)}
          onUnregister={() =>
            unregisterTeam({ variables: { eventId: reg.eventId, teamId: reg.teamId } })
          }
        />
      )}
    </Panel>
  );
}
