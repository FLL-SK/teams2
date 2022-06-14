import React from 'react';
import { Box, Button, Markdown, Spinner, Text } from 'grommet';
import { LabelValue } from '../../../components/label-value';
import { ListRow } from '../../../components/list-row';
import { Panel } from '../../../components/panel';
import {
  TeamFragmentFragment,
  useGetEventQuery,
  useGetProgramQuery,
} from '../../../generated/graphql';
import { RegisterDetails } from './types';
import { InvoiceItemList } from '../../../components/invoice-item-list';

interface RegisterReviewProps {
  team?: TeamFragmentFragment;
  details: RegisterDetails;
  nextStep: () => void;
  prevStep: () => void;
  cancel: () => void;
}

export function RegisterReview(props: RegisterReviewProps) {
  const { team, details, nextStep, prevStep, cancel } = props;
  const { data: programData, loading: programLoading } = useGetProgramQuery({
    variables: { id: details.program?.id ?? '0' },
  });
  const { data: eventData, loading: eventLoading } = useGetEventQuery({
    variables: { id: details.event?.id ?? '0' },
  });

  if (!team) {
    return null;
  }

  const program = programData?.getProgram;
  const event = eventData?.getEvent;

  const items =
    ((event?.invoiceItems?.length ?? 0) > 0 ? event?.invoiceItems : program?.invoiceItems) ?? [];

  console.log('items', items, event?.invoiceItems, program?.invoiceItems);

  return (
    <Box gap="medium">
      <Text>Skontrolujte zadané údaje.</Text>
      <Panel title="Registrácia" gap="small">
        <LabelValue labelWidth="150px" label="Tím" value={team.name} />
        <LabelValue labelWidth="150px" label="Program" value={details.program?.name} />
        <LabelValue labelWidth="150px" label="Turnaj" value={details.event?.name} />
      </Panel>

      <Panel title="Poplatky" gap="small">
        {programLoading || eventLoading ? <Spinner /> : <InvoiceItemList items={items} />}
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

      {(program?.conditions || event?.conditions) && (
        <Panel title="Podmienky" gap="small">
          {program?.conditions && (
            <LabelValue label="Podmienky programu" labelWidth="150px">
              <Box background="light-2" flex pad="small">
                <Markdown>{program?.conditions ?? ''}</Markdown>
              </Box>
            </LabelValue>
          )}
          {event?.conditions && (
            <LabelValue label="Podmienky turnaja" labelWidth="150px">
              <Box background="light-2" flex pad="small">
                <Markdown>{event?.conditions ?? ''}</Markdown>
              </Box>
            </LabelValue>
          )}
        </Panel>
      )}

      <Box justify="between" direction="row">
        <Button label="Späť" onClick={prevStep} />
        <Button plain label="Zrušiť" hoverIndicator onClick={cancel} />
        <Button primary label="Registrovať" onClick={nextStep} />
      </Box>
    </Box>
  );
}
