import React from 'react';
import { Box, Button, Spinner, Text } from 'grommet';
import { StatusCritical, StatusGood } from 'grommet-icons';
import { LabelValue } from '../../../components/label-value';
import { Panel } from '../../../components/panel';
import { TeamFragmentFragment } from '../../../generated/graphql';
import { RegisterDetails } from './types';

interface RegisterSuccessProps {
  team?: TeamFragmentFragment;
  details: RegisterDetails;
  nextStep: () => void;
  invoiceNo?: string;
  sentOn?: Date;
  timeoutError?: boolean;
}

export function RegisterSuccess(props: RegisterSuccessProps) {
  const { team, details, nextStep, invoiceNo, sentOn, timeoutError } = props;

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

      <Panel gap="small">
        <LabelValue labelWidth="280px" label="Faktúra vystavená">
          {invoiceNo ? (
            <StatusGood color="green" />
          ) : timeoutError ? (
            <StatusCritical color="red" />
          ) : (
            <Spinner />
          )}
        </LabelValue>
        <LabelValue labelWidth="280px" label="Faktúra odoslaná emailom">
          {sentOn ? (
            <StatusGood color="green" />
          ) : timeoutError ? (
            <StatusCritical color="red" />
          ) : (
            <Spinner />
          )}
        </LabelValue>
        {timeoutError && (
          <Box margin="medium" pad="medium" border={{ color: 'status-critical', size: 'medium' }}>
            <Text>
              Registrácia prebehla úspešne, ale nastala chyba pri spracovaní faktúry. Prosíme,
              kontaktujte nás.
            </Text>
          </Box>
        )}
      </Panel>

      <Box justify="between" direction="row">
        <Button primary label="Dokončiť" onClick={nextStep} />
      </Box>
    </Box>
  );
}
