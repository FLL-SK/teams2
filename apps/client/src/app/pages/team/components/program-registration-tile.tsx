import React, { useMemo } from 'react';
import { Anchor, Box, Button, Paragraph, Text } from 'grommet';
import { TeamRegistrationFragmentFragment } from '../../../_generated/graphql';
import { LabelValueGroup } from '../../../components/label-value-group';
import { LabelValue } from '../../../components/label-value';
import { appPath } from '@teams2/common';
import { RegistrationFilesPanel } from '../../registration/components/registration-files';
import { EventRegistrationTile } from './event-registration-tile';
import { useNavigate } from 'react-router-dom';

interface ProgramRegistrationTileProps {
  registration: TeamRegistrationFragmentFragment;
  eventRegistrations: TeamRegistrationFragmentFragment[];
}

export function ProgramRegistrationTile(props: ProgramRegistrationTileProps) {
  const { registration, eventRegistrations } = props;

  const navigate = useNavigate();

  const canEdit = useMemo(() => {
    return !registration.canceledOn && registration.confirmedOn;
  }, [registration]);

  return (
    <Box>
      <Box direction="row" width="100%" gap="small" background={'light-4'} wrap pad={'small'}>
        <Box direction="row" gap="small" width="400px" pad={{ top: 'small' }} align="center">
          <Text>Program</Text>
          <Anchor label={registration.program.name} href={appPath.registration(registration.id)} />
        </Box>
        <Box direction="row" gap="small" width="200px" pad={{ top: 'small' }} align="center">
          <Text>Typ</Text>
          <Text>{registration.type}</Text>
        </Box>
      </Box>

      <Box background={'light-2'} pad="small">
        <Text weight={'bold'}>Súbory</Text>
        <Box gap="small" background="light-2">
          <RegistrationFilesPanel
            registrationId={registration.id}
            regConfirmed={!!registration.confirmedOn}
          />
        </Box>
      </Box>
      <Box background={'light-2'} pad="small">
        <Text weight={'bold'}>Turnaje</Text>
        {eventRegistrations.map((r) => (
          <Box key={r.id}>
            <hr />
            <EventRegistrationTile registration={r} canEdit={canEdit} />
          </Box>
        ))}
        <Box direction="row" pad={{ top: 'small' }}>
          <Button
            label="Registrovať na turnaj"
            onClick={() =>
              navigate(appPath.registerEvent(registration.teamId, registration.programId))
            }
            disabled={!canEdit}
          />
        </Box>
      </Box>
    </Box>
  );
}
