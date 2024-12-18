import { Box, Button, Text, Tip } from 'grommet';
import { Group as GroupIcon, Cafeteria as CafeteriaIcon } from 'grommet-icons';
import React, { useMemo, useState } from 'react';
import { ListRow2 } from '../../../components/list-row';
import { Panel } from '../../../components/panel';
import { EventFragmentFragment, RegisteredTeamFragmentFragment } from '../../../_generated/graphql';
import { fullAddress } from '../../../utils/format-address';
import { formatTeamSize } from '../../../utils/format-teamsize';
import { handleExportRegisteredTeams } from './handle-export-teams';
import { useNavigate } from 'react-router-dom';
import { appPath } from '@teams2/common';
import { Modal } from '../../../components/modal';
import { useAppUser } from '../../../components/app-user/use-app-user';
import { handleExportForEventHub } from './handle-export-for-eventhub';

interface PanelEventTeamsProps {
  event: EventFragmentFragment;
  registrations?: RegisteredTeamFragmentFragment[];
  canEdit?: boolean;
}

export function PanelEventTeams(props: PanelEventTeamsProps) {
  const { event, canEdit, registrations: regs } = props;
  const navigate = useNavigate();
  const [showCoachesEmails, setShowCoachesEmails] = useState(false);
  const { isAdmin } = useAppUser();

  const coachesEmails: string[] = useMemo(
    () =>
      event && regs
        ? regs.reduce((t: string[], reg) => {
            const c = (reg?.coaches ?? []).map((c) => c.username).filter((c) => !t.includes(c));
            return [...t, ...c];
          }, [])
        : [],
    [event, regs],
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
            columns="50px 1fr 100px 100px auto"
            pad="small"
            align="center"
            onClick={isAdmin() ? () => navigate(appPath.registration(reg.id)) : undefined}
          >
            <Text>{idx + 1}</Text>
            <Box>
              <Text>{reg.name}</Text>
              <Text size="small">{fullAddress(reg.address)}</Text>
            </Box>
            <Box>
              {reg.foodOrder ? (
                <Tip content="Objednávka jedla">
                  <CafeteriaIcon color={reg.foodOrder.invoicedOn ? 'green' : undefined} />
                </Tip>
              ) : null}
            </Box>
            <Box direction="row" gap="small">
              <Tip content="Počet členov tímu">
                <GroupIcon />
              </Tip>
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

          <Button
            label="Export pre EventHub"
            onClick={() =>
              handleExportForEventHub(event?.program.name ?? '', event.name, regs ?? [])
            }
          />
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
