import React from 'react';
import { appPath } from '@teams2/common';
import { formatDate } from '@teams2/dateutils';
import { Anchor, Box, Text } from 'grommet';
import { LabelValue } from '../../../components/label-value';
import { LabelValueGroup } from '../../../components/label-value-group';
import { RegistrationFragmentFragment } from '../../../generated/graphql';
import { fullAddress } from '../../../utils/format-address';
import { Panel } from '../../../components/panel';
import { formatFullName } from '../../../utils/format-fullname';

interface PanelDetailsProps {
  registration: RegistrationFragmentFragment;
  columnWidth: string;
}

export function PanelDetails(props: PanelDetailsProps) {
  const { registration: reg, columnWidth } = props;

  return (
    <Panel title="Detaily registrácie" wrap direction="row" gap="small">
      <Box width={columnWidth}>
        <LabelValueGroup labelWidth="150px" gap="small" direction="row">
          <LabelValue label="Program">
            <Anchor label={reg.program.name} href={appPath.program(reg.program.id)} />
          </LabelValue>
          <LabelValue label="Turnaj">
            <Anchor label={reg.event.name} href={appPath.event(reg.event.id)} />
          </LabelValue>
          <LabelValue label="Tím">
            <Anchor label={reg.team.name} href={appPath.team(reg.team.id)} />
          </LabelValue>
          <LabelValue label="Zriaďovateľ tímu" value={fullAddress(reg.team.address)} />
          <LabelValue label="Dátum registrácie" value={formatDate(reg.registeredOn)} />
        </LabelValueGroup>
      </Box>
      <Box width={columnWidth}>
        <LabelValueGroup labelWidth="150px" gap="small">
          {reg.team.coaches
            .filter((coach) => !coach.deletedOn)
            .map((coach) => (
              <LabelValue label={formatFullName(coach.firstName, coach.lastName)} key={coach.id}>
                <Text>{coach.username}</Text>
                <Text>{coach.phone}</Text>
              </LabelValue>
            ))}
        </LabelValueGroup>
      </Box>
    </Panel>
  );
}
