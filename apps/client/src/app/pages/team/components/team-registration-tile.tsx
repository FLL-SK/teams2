import React, { useMemo } from 'react';
import { Anchor, Box, Button, Paragraph, Text } from 'grommet';
import { TeamRegistrationFragmentFragment } from '../../../_generated/graphql';
import { LabelValueGroup } from '../../../components/label-value-group';
import { LabelValue } from '../../../components/label-value';
import { appPath } from '@teams2/common';
import { RegistrationFilesPanel } from '../../registration/components/registration-files';
import { EventRegistrationTile } from './event-registration-tile';
import { useNavigate } from 'react-router-dom';

interface TeamRegistrationTileProps {
  registration: TeamRegistrationFragmentFragment;
  allRegistrations: TeamRegistrationFragmentFragment[];
}

export function TeamRegistrationTile(props: TeamRegistrationTileProps) {
  const { registration, allRegistrations } = props;

  const navigate = useNavigate();

  const eventReg = useMemo(
    () =>
      allRegistrations.find(
        (r) => r.eventId && r.programId === registration.programId && !r.canceledOn,
      ),
    [allRegistrations, registration.programId],
  );

  return (
    <Box>
      <Box direction="row" width="100%" gap="small" pad="small" background={'light-3'} wrap>
        <Box width="40%">
          <LabelValueGroup labelWidth="150px" direction="row" gap="small">
            <LabelValue label="Program">
              <Anchor
                label={registration.program.name}
                href={appPath.program(registration.program.id)}
              />
            </LabelValue>
            <LabelValue label="Registrácia">
              <Anchor
                label="Otvor detaily registrácie do programu"
                href={appPath.registration(registration.id)}
              />
            </LabelValue>

            {!registration.event && (
              <LabelValue label="Typ registrácie">
                <Text>{registration.type}</Text>
              </LabelValue>
            )}
          </LabelValueGroup>
        </Box>

        <Box width="55%">
          {eventReg ? (
            <EventRegistrationTile registration={eventReg} />
          ) : (
            <Box direction="row">
              <Button
                label="Registrovať na turnaj"
                onClick={() =>
                  navigate(appPath.registerEvent(registration.teamId, registration.programId))
                }
                disabled={!!registration.canceledOn || !registration.confirmedOn}
              />
            </Box>
          )}
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
    </Box>
  );
}
