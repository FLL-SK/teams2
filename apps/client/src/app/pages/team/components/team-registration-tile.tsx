import React from 'react';
import { formatDate } from '@teams2/dateutils';
import { Anchor, Box, Text } from 'grommet';
import { TeamRegistrationFragmentFragment } from '../../../generated/graphql';
import { LabelValueGroup } from '../../../components/label-value-group';
import { LabelValue } from '../../../components/label-value';
import { FieldTeamSize } from '../../registrations/components/field-teamSize';
import { FieldTeamSizeConfirmedOn } from '../../registrations/components/field-teamSizeConfirmedOn';
import { appPath } from '@teams2/common';
import { FieldConfirmedOn } from '../../registrations/components/field-confirmedOn';
import { useAppUser } from '../../../components/app-user/use-app-user';
import { RegistrationFilesPanel } from '../../registration/components/registration-files';

interface TeamRegistrationTileProps {
  registration: TeamRegistrationFragmentFragment;
}

export function TeamRegistrationTile(props: TeamRegistrationTileProps) {
  const { registration } = props;
  const { isAdmin } = useAppUser();

  return (
    <Box>
      <Box direction="row" width="100%" gap="small" pad="small" background={'light-3'}>
        <Box width="60%">
          <LabelValueGroup labelWidth="150px" direction="row" gap="small">
            <LabelValue label="Turnaj">
              <Anchor label={registration.event.name} href={appPath.event(registration.event.id)} />
            </LabelValue>
            <LabelValue label="Program">
              <Anchor
                label={registration.program.name}
                href={appPath.program(registration.program.id)}
              />
            </LabelValue>
            <LabelValue label="Dátum turnaja">
              <Text>
                {registration.event.date ? formatDate(registration.event.date) : 'neurčený'}
              </Text>
            </LabelValue>
          </LabelValueGroup>
        </Box>

        <Box width="35%">
          <LabelValueGroup labelWidth="150px" gap="small" direction="row">
            <FieldConfirmedOn
              registration={registration}
              readOnly={!!registration.canceledOn || !isAdmin()}
            />
            <FieldTeamSize registration={registration} readOnly={!!registration.canceledOn} />
            <FieldTeamSizeConfirmedOn
              registration={registration}
              teamId={registration.teamId}
              readOnly={!!registration.canceledOn}
            />
          </LabelValueGroup>
        </Box>
      </Box>
      <Box background={'light-2'} pad="small">
        <Text weight={'bold'}>Súbory</Text>
        <Box direction="row" wrap gap="small" background="light-2">
          <RegistrationFilesPanel registrationId={registration.id} />
        </Box>
      </Box>
    </Box>
  );
}
