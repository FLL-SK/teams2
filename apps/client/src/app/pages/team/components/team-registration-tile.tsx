import React from 'react';
import { formatDate } from '@teams2/dateutils';
import { Anchor, Box, Paragraph, Text } from 'grommet';
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
      <Box direction="row" width="100%" gap="small" pad="small" background={'light-3'} wrap>
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
            <LabelValue label="Typ registrácie">
              <Text>{registration.type}</Text>
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
            {registration.program.maxTeamSize &&
              registration.girlCount + registration.boyCount > registration.program.maxTeamSize && (
                <Paragraph color="status-critical">
                  Počet detí v tíme je väčší ako dovoľujú pravidlá programu. Maximálna veľkosť tímu
                  je {registration.program.maxTeamSize}. Na turnaji sa môže súťažne zúčastniť iba
                  povolený počet detí. Ostatní sa môžu zúčastniť ako diváci.
                </Paragraph>
              )}
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
          <RegistrationFilesPanel
            registrationId={registration.id}
            regConfirmed={!!registration.confirmedOn}
          />
        </Box>
      </Box>
    </Box>
  );
}
