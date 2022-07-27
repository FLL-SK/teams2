import { Box, Button, Text } from 'grommet';
import { Group } from 'grommet-icons';
import React, { useMemo, useState } from 'react';
import { ListRow2 } from '../../../components/list-row';
import { Panel } from '../../../components/panel';
import {
  EventFragmentFragment,
  TeamBasicFragmentFragment,
  useSwitchTeamEventMutation,
  useUnregisterTeamFromEventMutation,
} from '../../../generated/graphql';
import { TeamMenu } from './team-menu';
import { fullAddress } from '../../../utils/format-address';
import { formatTeamSize } from '../../../utils/format-teamsize';
import { handleExportRegistrations } from './handle-export';
import { ChangeTeamEventDialog } from '../../../components/dialogs/change-team-event-dialog';
import { ConfirmTeamUnregisterDialog } from '../../../components/dialogs/confirm-team-unregister';

interface PanelEventTeamsProps {
  event?: EventFragmentFragment;
  canEdit?: boolean;
}

export function PanelEventTeams(props: PanelEventTeamsProps) {
  const { event, canEdit } = props;
  const [teamToUnregister, setTeamToUnregister] = useState<TeamBasicFragmentFragment>();
  const [teamToSwitch, setTeamToSwitch] = useState<TeamBasicFragmentFragment>();

  const [unregisterTeam] = useUnregisterTeamFromEventMutation();
  const [switchTeamEvent] = useSwitchTeamEventMutation();

  const eventRegs = useMemo(
    () => [...(event?.registrations ?? [])].sort((a, b) => (a.team.name < b.team.name ? -1 : 1)),
    [event]
  );

  if (!event) {
    return null;
  }

  return (
    <Panel title="Tímy" gap="small">
      <Box direction="row" wrap>
        {eventRegs.map((reg, idx) => (
          <ListRow2 key={reg.id} columns="50px 1fr 80px auto" pad="small" align="center">
            <Text>{idx + 1}</Text>
            <Box>
              <Text>{reg.team.name}</Text>
              <Text size="small">{fullAddress(reg.team.address)}</Text>
            </Box>
            <Box direction="row" gap="small">
              <Group />
              <Text>
                {formatTeamSize(reg)}
                {!reg.sizeConfirmedOn && ' ?'}
              </Text>
            </Box>

            <Box width="50px" justify="end">
              {canEdit && (
                <TeamMenu
                  team={reg.team}
                  onUnregister={(tt) => setTeamToUnregister(tt)}
                  onChangeEvent={(tt) => setTeamToSwitch(tt)}
                  canEdit={canEdit}
                />
              )}
            </Box>
          </ListRow2>
        ))}
      </Box>

      {canEdit && (
        <Box direction="row">
          <Button
            label="Export tímov"
            onClick={() => handleExportRegistrations(event?.program.name ?? '', eventRegs)}
          />
        </Box>
      )}
      <ChangeTeamEventDialog
        show={!!teamToSwitch}
        team={teamToSwitch}
        event={event}
        onClose={() => setTeamToSwitch(undefined)}
        onSubmit={(e) =>
          switchTeamEvent({
            variables: {
              teamId: teamToSwitch?.id ?? '0',
              oldEventId: event?.id ?? '0',
              newEventId: e.id,
            },
          })
        }
      />

      {teamToUnregister && (
        <ConfirmTeamUnregisterDialog
          teamName={teamToUnregister.name}
          onClose={() => setTeamToUnregister(undefined)}
          onUnregister={() =>
            unregisterTeam({ variables: { eventId: event.id, teamId: teamToUnregister.id } })
          }
        />
      )}
    </Panel>
  );
}
