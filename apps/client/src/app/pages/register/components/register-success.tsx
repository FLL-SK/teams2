import React from 'react';
import { Box, Button, Paragraph, Text } from 'grommet';
import { LabelValue } from '../../../components/label-value';
import { Panel } from '../../../components/panel';
import { TeamFragmentFragment } from '../../../generated/graphql';
import { RegisterDetails } from './types';

interface RegisterSuccessProps {
  team?: TeamFragmentFragment;
  details: RegisterDetails;
  nextStep: () => void;
  timeoutError?: boolean;
}

export function RegisterSuccess(props: RegisterSuccessProps) {
  const { team, details, nextStep, timeoutError } = props;

  if (!team) {
    return null;
  }

  return (
    <Box gap="medium">
      <Text>Vaša požiadavka na registráciu na turnaj bola úspešne zaevidovaná.</Text>
      <Panel title="Registrácia" gap="small">
        <LabelValue labelWidth="150px" label="Tím" value={team.name} />
        <LabelValue labelWidth="150px" label="Program" value={details.program?.name} />
        <LabelValue labelWidth="150px" label="Turnaj" value={details.event?.name} />
      </Panel>
      {(details.items ?? []).length > 0 && (
        <Paragraph>
          V najblišom čase zašleme na vami uvedený email {details.billTo?.email} faktúru. Jej úhrade
          je podmienkou registrácie. V prípade, že faktúru nedostanete skontrolujte, prosím, váš
          priečinok s nevyžiadanou poštou a následne nás kontaktujte.
        </Paragraph>
      )}

      <Box justify="between" direction="row">
        <Button primary label="Dokončiť" onClick={nextStep} />
      </Box>
    </Box>
  );
}
