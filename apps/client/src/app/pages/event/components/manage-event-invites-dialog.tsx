import { Box, Button, Text } from 'grommet';
import { EventFragmentFragment, TeamListFragmentFragment } from '../../../_generated/graphql';
import { Modal } from '../../../components/modal';
import { Close } from 'grommet-icons';
import { useState } from 'react';
import { ListRow2 } from '../../../components/list-row';
import React from 'react';

interface ManageEventInvitesDialogProps {
  show?: boolean;
  event: EventFragmentFragment;
  invitableTeams: { id: string; name: string; teamNo: string }[];
  onClose: () => void;
  onInvite?: (teamId: string) => void;
  onUninvite?: (teamId: string) => void;
}

export function ManageEventInvitesDialog(props: ManageEventInvitesDialogProps) {
  const { event, onClose, onInvite, onUninvite, show = true } = props;
  const [showSelectTeam, setShowSelectTeam] = useState(false);

  const sortedInvitedTeams = React.useMemo(() => {
    const i = [...event.invitedTeams];
    i.sort((a, b) => a.name.localeCompare(b.name));
    return i;
  }, [event.invitedTeams]);

  return (
    <>
      <Modal title="Pozvané tímy" onClose={onClose} show={show} width="medium">
        <Box gap="medium">
          {event.invitedTeams.length === 0 && (
            <Text>Na tento turnaj zatiaľ neboli pozvané žiadne tímy.</Text>
          )}

          <Box gap="small">
            {sortedInvitedTeams.map((team) => (
              <ListRow2 key={team.id} columns="50px auto" align="center">
                <Button
                  plain
                  icon={<Close size="small" />}
                  onClick={() => onUninvite && onUninvite(team.id)}
                />

                <Text>{team.name}</Text>
              </ListRow2>
            ))}
            <Box direction="row" gap="small" justify="center">
              <Button label="Pozvať tím" onClick={() => setShowSelectTeam(true)} />
            </Box>
          </Box>
        </Box>
      </Modal>

      <Modal
        title="Vybrať tím"
        onClose={() => setShowSelectTeam(false)}
        show={showSelectTeam}
        width="medium"
        height="auto"
        overflow={{ vertical: 'auto' }}
      >
        <Text>Vyberte tím, ktorý chcete pozvať na turnaj:</Text>
        <Box gap="small">
          {props.invitableTeams.map((team) => (
            <Button
              key={team.id}
              label={'(' + team.teamNo + ') ' + team.name}
              onClick={() => {
                setShowSelectTeam(false);
                onInvite && onInvite(team.id);
              }}
              disabled={event.invitedTeamsIds.some((t) => t === team.id)}
            />
          ))}
        </Box>
      </Modal>
    </>
  );
}
