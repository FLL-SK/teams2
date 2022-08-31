import { Box, Button, Text } from 'grommet';
import { Group } from 'grommet-icons';
import React, { useMemo, useState } from 'react';
import { ListRow2 } from '../../../components/list-row';
import { Panel } from '../../../components/panel';
import { EventFragmentFragment, useGetRegisteredTeamsQuery } from '../../../generated/graphql';
import { fullAddress } from '../../../utils/format-address';
import { formatTeamSize } from '../../../utils/format-teamsize';
import { handleExportRegisteredTeams } from './handle-export';
import { useNavigate } from 'react-router-dom';
import { appPath } from '@teams2/common';
import { Modal } from '../../../components/modal';
import { useAppUser } from '../../../components/app-user/use-app-user';

interface PanelEventTeamsProps {
  event: EventFragmentFragment;
  canEdit?: boolean;
}

export function PanelEventTeams(props: PanelEventTeamsProps) {
  const { event, canEdit } = props;
  const navigate = useNavigate();
  const [showCoachesEmails, setShowCoachesEmails] = useState(false);
  const { isAdmin } = useAppUser();

  const { data } = useGetRegisteredTeamsQuery({
    variables: { eventId: event.id, includeCoaches: canEdit },
  });

  const regs = data?.getRegisteredTeams;

  const coachesEmails: string[] = useMemo(
    () =>
      event && regs
        ? regs.reduce((t: string[], reg) => {
            const c = (reg?.coaches ?? []).map((c) => c.username).filter((c) => !t.includes(c));
            return [...t, ...c];
          }, [])
        : [],
    [event, regs]
  );

  if (!event) {
    return null;
  }

  return (
    <Panel title="Tímy" gap="small">
      <Box direction="row" wrap>
        {(regs ?? []).map((reg, idx) => (
          <ListRow2
            key={reg.id}
            columns="50px 1fr 80px auto"
            pad="small"
            align="center"
            onClick={isAdmin() ? () => navigate(appPath.registration(reg.id)) : undefined}
          >
            <Text>{idx + 1}</Text>
            <Box>
              <Text>{reg.name}</Text>
              <Text size="small">{fullAddress(reg.address)}</Text>
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
        <Box direction="row" gap="small">
          <Button
            label="Export tímov"
            onClick={() =>
              handleExportRegisteredTeams(event?.program.name ?? '', event.name, regs ?? [])
            }
          />
          <Button label="Emaily trénerov" onClick={() => setShowCoachesEmails(true)} />
        </Box>
      )}

      <Modal
        title="Emaily trénerov"
        show={showCoachesEmails}
        onClose={() => setShowCoachesEmails(false)}
        height="medium"
        width="medium"
      >
        <Box overflow={{ vertical: 'auto' }}>
          {coachesEmails.map((email, idx) => (
            <Text key={idx}>{email}</Text>
          ))}
        </Box>
      </Modal>
    </Panel>
  );
}
