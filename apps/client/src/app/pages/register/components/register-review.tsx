import React from 'react';
import { Box, Button, Text } from 'grommet';
import { LabelValue } from '../../../components/label-value';
import { ListRow } from '../../../components/list-row';
import { Panel } from '../../../components/panel';
import { TeamFragmentFragment } from '../../../generated/graphql';
import { RegisterDetails } from './types';

interface RegisterReviewProps {
  team?: TeamFragmentFragment;
  details: RegisterDetails;
  nextStep: () => void;
  prevStep: () => void;
  cancel: () => void;
}

export function RegisterReview(props: RegisterReviewProps) {
  const { team, details, nextStep, prevStep, cancel } = props;

  if (!team) {
    return null;
  }

  return (
    <Box gap="medium">
      <Text>Skontrolujte zadané údaje.</Text>
      <Panel title="Registrácia" gap="small">
        <LabelValue labelWidth="150px" label="Tím" value={team.name} />
        <LabelValue labelWidth="150px" label="Program" value={details.program?.name} />
        <LabelValue labelWidth="150px" label="Turnaj" value={details.event?.name} />
      </Panel>

      <Panel title="Registračný poplatok" gap="small">
        {(details.items ?? []).map((item) => (
          <ListRow key={item.lineNo} columns="1fr 1fr 1fr 1fr 1fr">
            <Text>{item.lineNo}</Text>
            <Text>{item.text}</Text>
            <Text>{item.quantity}</Text>
            <Text>{item.unitPrice}</Text>
            <Text>{item.quantity * item.unitPrice}</Text>
          </ListRow>
        ))}
      </Panel>

      <Panel title="Fakturačná adresa" gap="small">
        <LabelValue labelWidth="150px" label="Názov/meno" value={details?.billTo?.name} />
        <LabelValue labelWidth="150px" label="Adresa" value={details?.billTo?.street} />
        <LabelValue labelWidth="150px" label="Mesto" value={details?.billTo?.city} />
        <LabelValue labelWidth="150px" label="PSČ" value={details?.billTo?.zip} />
        <LabelValue labelWidth="150px" label="Krajina" value={details?.billTo?.countryCode} />

        <LabelValue labelWidth="150px" label="IČO" value={details?.billTo?.companyNumber} />
        <LabelValue labelWidth="150px" label="DIČ" value={details?.billTo?.taxNumber} />
        <LabelValue labelWidth="150px" label="IČ-DPH" value={details?.billTo?.vatNumber} />

        <LabelValue
          labelWidth="150px"
          label="Kontaktná osoba"
          value={details?.billTo?.contactName}
        />
        <LabelValue labelWidth="150px" label="Telefón" value={details?.billTo?.phone} />
        <LabelValue labelWidth="150px" label="Email" value={details?.billTo?.email} />
      </Panel>

      <Panel title="Dodacia adresa" gap="small">
        <LabelValue labelWidth="150px" label="Názov/meno" value={details?.shipTo?.name} />
        <LabelValue labelWidth="150px" label="Adresa" value={details?.shipTo?.street} />
        <LabelValue labelWidth="150px" label="Mesto" value={details?.shipTo?.city} />
        <LabelValue labelWidth="150px" label="PSČ" value={details?.shipTo?.zip} />
        <LabelValue labelWidth="150px" label="Krajina" value={details?.shipTo?.countryCode} />

        <LabelValue
          labelWidth="150px"
          label="Kontaktná osoba"
          value={details?.shipTo?.contactName}
        />
        <LabelValue labelWidth="150px" label="Telefón" value={details?.shipTo?.phone} />
        <LabelValue labelWidth="150px" label="Email" value={details?.shipTo?.email} />
      </Panel>

      <Box justify="between" direction="row">
        <Button label="Späť" onClick={prevStep} />
        <Button plain label="Zrušiť" hoverIndicator onClick={cancel} />
        <Button primary label="Registrovať" onClick={nextStep} />
      </Box>
    </Box>
  );
}
