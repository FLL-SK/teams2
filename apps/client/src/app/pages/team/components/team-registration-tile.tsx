import React from 'react';
import { formatDate } from '@teams2/dateutils';
import { Box, Text } from 'grommet';
import { RegistrationListFragmentFragment } from '../../../generated/graphql';
import { LabelValueGroup } from '../../../components/label-value-group';
import { LabelValue } from '../../../components/label-value';
import { FieldTeamSize } from '../../registrations/components/field-teamSize';
import { FieldTeamSizeConfirmedOn } from '../../registrations/components/field-teamSizeConfirmedOn';

interface TeamRegistrationTileProps {
  registration: RegistrationListFragmentFragment;

  onClick?: () => void;
}

export function TeamRegistrationTile(props: TeamRegistrationTileProps) {
  const { registration, onClick } = props;

  return (
    <Box
      direction="row"
      hoverIndicator
      width="100%"
      onClick={() => onClick && onClick()}
      gap="small"
      pad="small"
      background={'light-3'}
    >
      <Box width="60%">
        <LabelValueGroup labelWidth="100px" direction="row" gap="small">
          <LabelValue label="Turnaj" value={registration.event.name} />
          <LabelValue label="Program" value={registration.program.name} />
          <LabelValue label="Dátum turnaja">
            <Text>
              {registration.event.date ? formatDate(registration.event.date) : 'neurčený'}
            </Text>
          </LabelValue>
        </LabelValueGroup>
      </Box>

      <Box width="35%">
        <LabelValueGroup labelWidth="150px" gap="small" direction="row">
          <FieldTeamSize registration={registration} />
          <FieldTeamSizeConfirmedOn registration={registration} />
        </LabelValueGroup>
      </Box>
    </Box>
  );
}
