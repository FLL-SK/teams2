import React from 'react';
import { Box, Button, Paragraph } from 'grommet';
import { LabelValue } from '../../../components/label-value';
import { Panel } from '../../../components/panel';
import { TeamFragmentFragment } from '../../../_generated/graphql';
import { RegisterDetails } from './types';
import { LabelValueGroup } from '../../../components/label-value-group';

interface RegisterSuccessProps {
  team: TeamFragmentFragment;
  details: RegisterDetails;
  nextStep: () => void;
}

export function RegisterSuccess(props: RegisterSuccessProps) {
  const { team, details, nextStep } = props;

  return (
    <Box gap="medium">
      <Paragraph style={{ maxWidth: '100%' }}>
        Vaša požiadavka na registráciu na turnaj bola úspešne zaevidovaná. <br /> Registrácia bude
        platná až po tom ako náš tím spracuje a akceptuje vašu požiadavku.
      </Paragraph>
      <Panel title="Registrácia" gap="small">
        <LabelValueGroup labelWidth="150px" gap="small">
          <LabelValue label="Tím" value={team.name} />
          <LabelValue label="Program" value={details.program?.name} />
          <LabelValue label="Turnaj" value={details.event?.name} />
        </LabelValueGroup>
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
