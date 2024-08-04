import { Anchor, Paragraph, Text } from 'grommet';
import {
  RegistrationFragmentFragment,
  TeamRegistrationFragmentFragment,
} from '../../../_generated/graphql';
import { LabelValue } from '../../../components/label-value';
import { LabelValueGroup } from '../../../components/label-value-group';
import { FieldConfirmedOn } from '../../registrations/components/field-confirmedOn';
import { FieldTeamSize } from '../../registrations/components/field-teamSize';
import { FieldTeamSizeConfirmedOn } from '../../registrations/components/field-teamSizeConfirmedOn';
import { formatDate } from '@teams2/dateutils';
import { appPath } from '@teams2/common';
import { useAppUser } from '../../../components/app-user/use-app-user';

interface EventRegistrationTileProps {
  registration: TeamRegistrationFragmentFragment;
}

export function EventRegistrationTile(props: EventRegistrationTileProps) {
  const { registration } = props;
  const { isAdmin } = useAppUser();

  if (!registration.event) {
    return null;
  }

  return (
    <LabelValueGroup labelWidth="250px" gap="small" direction="row">
      <LabelValue label="Turnaj">
        <Anchor label={registration.event.name} href={appPath.event(registration.event.id)} />
      </LabelValue>
      <LabelValue label="Registracia na turnaj">
        <Anchor
          label="Otvor detaily registracie na turnaj"
          href={appPath.registration(registration.id)}
        />
      </LabelValue>

      <LabelValue label="Dátum turnaja">
        <Text>{registration.event.date ? formatDate(registration.event.date) : 'neurčený'}</Text>
      </LabelValue>

      <FieldTeamSize registration={registration} readOnly={!!registration.canceledOn} />

      {registration.program.maxTeamSize &&
      registration.girlCount + registration.boyCount > registration.program.maxTeamSize ? (
        <Paragraph color="status-critical">
          Počet detí v tíme je väčší ako dovoľujú pravidlá programu. Maximálna veľkosť tímu je{' '}
          {registration.program.maxTeamSize}. Na turnaji sa môže súťažne zúčastniť iba povolený
          počet detí. Ostatní sa môžu zúčastniť ako diváci.
        </Paragraph>
      ) : null}
      <FieldTeamSizeConfirmedOn
        registration={registration}
        teamId={registration.teamId}
        readOnly={!!registration.canceledOn}
      />
    </LabelValueGroup>
  );
}
