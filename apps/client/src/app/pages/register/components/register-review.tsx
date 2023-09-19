import React, { useState } from 'react';
import { Box, Button, CheckBox, Markdown, Spinner, Text } from 'grommet';
import { LabelValue } from '../../../components/label-value';
import { Panel } from '../../../components/panel';
import {
  TeamFragmentFragment,
  useGetEventLazyQuery,
  useGetProgramLazyQuery,
} from '../../../generated/graphql';
import { RegisterDetails } from './types';
import { InvoiceItemList } from '../../../components/invoice-item-list';
import { LabelValueGroup } from '../../../components/label-value-group';

interface RegisterReviewProps {
  team: TeamFragmentFragment;
  details: RegisterDetails;
  nextStep: () => void;
  prevStep: () => void;
  cancel: () => void;
}

const labelWidth = '180px';

export function RegisterReview(props: RegisterReviewProps) {
  const { team, details, nextStep, prevStep, cancel } = props;

  const [fetchProgram, { data: programData, loading: programLoading }] = useGetProgramLazyQuery();
  const [fetchEvent, { data: eventData, loading: eventLoading }] = useGetEventLazyQuery();

  const [acceptedProgramTC, setAcceptedProgramTC] = useState<boolean>(false);
  const [acceptedEventTC, setAcceptedEventTC] = useState<boolean>(false);

  React.useEffect(() => {
    if (details.program) {
      fetchProgram({
        variables: { id: details.program.id },
      });
    }
  }, [details.program, fetchProgram]);

  React.useEffect(() => {
    if (details.event) {
      fetchEvent({
        variables: { id: details.event.id },
      });
    }
  }, [details.event, fetchEvent]);

  const program = programData?.getProgram;
  const event = eventData?.getEvent;

  const items = React.useMemo(() => {
    const i =
      ((event?.ownFeesAllowed ?? false) && (event?.invoiceItems?.length ?? 0) > 0
        ? event?.invoiceItems
        : program?.invoiceItems) ?? [];
    return i.filter((i) => i.public);
  }, [event, program]);

  if (programLoading || eventLoading) {
    return <Spinner />;
  }

  if (!program || !event) {
    return null;
  }

  const shipTo = details.shipTo;
  const billTo = details.billTo;

  return (
    <Box gap="medium">
      <Text>Skontrolujte zadané údaje.</Text>
      <Panel title="Registrácia" gap="small">
        <LabelValueGroup labelWidth={labelWidth} direction="row" gap="small">
          <LabelValue label="Tím" value={team.name} />
          <LabelValue label="Program" value={program.name} />
          <LabelValue label="Turnaj" value={event.name} />
          <LabelValue
            label="Typ"
            value={
              `${details.type} ` +
              (details.type === 'CLASS_PACK'
                ? `T:${details.teamsImpacted} D:${details.childrenImpacted} S:${details.setCount}`
                : '')
            }
          />
        </LabelValueGroup>
      </Panel>

      <Panel title="Poplatky" gap="small">
        <InvoiceItemList items={items} />
        <Box>
          <Text>
            Toto sú štandardné poplatky turnaja. Prípadné zľavy, napr. z dôvodu že vám bol
            poskytnutý grant budú zohľadnené vo faktúre.
          </Text>
        </Box>
      </Panel>

      <Panel title="Fakturačná adresa" gap="small">
        {billTo && (
          <Box gap="small">
            <LabelValueGroup labelWidth={labelWidth} direction="row" gap="small">
              <LabelValue label="Názov/meno" value={billTo.name} />
              <LabelValue label="Adresa" value={billTo.street} />
              <LabelValue label="Mesto" value={billTo.city} />
              <LabelValue label="PSČ" value={billTo.zip} />
              <LabelValue label="Krajina" value={billTo.countryCode} />

              <LabelValue label="IČO" value={billTo.companyNumber} />
              <LabelValue label="DIČ" value={billTo.taxNumber} />
              <LabelValue label="IČ-DPH" value={billTo.vatNumber} />

              <LabelValue label="Kontaktná osoba" value={details.billToContact?.name} />
              <LabelValue label="Telefón" value={details.billToContact?.phone} />
              <LabelValue label="Email" value={details.billToContact?.email} />
            </LabelValueGroup>
          </Box>
        )}
      </Panel>

      <Panel title="Dodacia adresa" gap="small">
        {details.useBillTo ? (
          <Text>Použijú sa fakturačné údaje</Text>
        ) : shipTo ? (
          <Box gap="small">
            <LabelValueGroup labelWidth={labelWidth} direction="row" gap="small">
              <LabelValue label="Názov/meno" value={shipTo.name} />
              <LabelValue label="Adresa" value={shipTo.street} />
              <LabelValue label="Mesto" value={shipTo.city} />
              <LabelValue label="PSČ" value={shipTo.zip} />
              <LabelValue label="Krajina" value={shipTo.countryCode} />

              <LabelValue label="Kontaktná osoba" value={shipTo.contactName} />
              <LabelValue label="Telefón" value={shipTo.phone} />
              <LabelValue label="Email" value={shipTo.email} />
            </LabelValueGroup>
          </Box>
        ) : null}
      </Panel>

      {(program.conditions || event.conditions) && (
        <Panel title="Podmienky" gap="small">
          {program.conditions && (
            <LabelValue label="Podmienky programu" labelWidth={labelWidth}>
              <Box background="light-2" flex pad="small">
                <Markdown>{program.conditions}</Markdown>
              </Box>
            </LabelValue>
          )}
          {event.conditions && (
            <LabelValue label="Podmienky turnaja" labelWidth={labelWidth}>
              <Box background="light-2" flex pad="small">
                <Markdown>{event.conditions}</Markdown>
              </Box>
            </LabelValue>
          )}
        </Panel>
      )}

      <Box>
        <CheckBox
          toggle
          label="Akceptujem podmienky programu"
          checked={acceptedProgramTC}
          onChange={({ target }) => setAcceptedProgramTC(target.checked)}
        />
        {event?.conditions && (
          <CheckBox
            toggle
            label="Akceptujem podmienky turnaja"
            checked={acceptedEventTC}
            onChange={({ target }) => setAcceptedEventTC(target.checked)}
          />
        )}
      </Box>

      <Box justify="between" direction="row">
        <Button label="Späť" onClick={prevStep} />
        <Button plain label="Zrušiť" hoverIndicator onClick={cancel} />
        <Button
          primary
          label="Registrovať"
          onClick={nextStep}
          disabled={!(acceptedProgramTC && (acceptedEventTC || !event.conditions))}
        />
      </Box>
    </Box>
  );
}
