import { Box, Button, Text } from 'grommet';
import { Group } from 'grommet-icons';
import React, { useMemo } from 'react';
import { ListRow2 } from '../../../components/list-row';
import { Panel } from '../../../components/panel';
import { EventFragmentFragment } from '../../../generated/graphql';
import { fullAddress } from '../../../utils/format-address';
import { formatTeamSize } from '../../../utils/format-teamsize';
import { handleExportRegistrations } from './handle-export';
import { useNavigate } from 'react-router-dom';
import { appPath } from '@teams2/common';

interface PanelEventTeamsProps {
  event?: EventFragmentFragment;
  canEdit?: boolean;
}

export function PanelEventTeams(props: PanelEventTeamsProps) {
  const { event, canEdit } = props;
  const navigate = useNavigate();

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
          <ListRow2
            key={reg.id}
            columns="50px 1fr 80px auto"
            pad="small"
            align="center"
            onClick={() => navigate(appPath.registration(reg.id))}
          >
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
            <Box />
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
    </Panel>
  );
}
