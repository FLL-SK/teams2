import { Box, Button, Text } from 'grommet';
import { LabelValue } from '../../../components/label-value';
import { Panel } from '../../../components/panel';
import { TeamFragmentFragment } from '../../../generated/graphql';
import { RegisterDetails } from './types';

interface RegisterSuccessProps {
  team?: TeamFragmentFragment;
  details: RegisterDetails;
  nextStep: () => void;
}

export function RegisterSuccess(props: RegisterSuccessProps) {
  const { team, details, nextStep } = props;

  if (!team) {
    return null;
  }

  return (
    <Box gap="medium">
      <Text>Registrácia prebehla úspešne.</Text>
      <Panel title="Registrácia" gap="small">
        <LabelValue labelWidth="150px" label="Tím" value={team.name} />
        <LabelValue labelWidth="150px" label="Program" value={details.program?.name} />
        <LabelValue labelWidth="150px" label="Turnaj" value={details.event?.name} />
      </Panel>

      <Box justify="between" direction="row">
        <Button primary label="Dokončiť" onClick={nextStep} />
      </Box>
    </Box>
  );
}
