import React from 'react';
import { Box, Button, Form, FormField, Grid, RadioButtonGroup, RangeInput, Text } from 'grommet';

import { RegistrationType } from '../../../generated/graphql';
import { RegisterDetails } from './types';
import styled from 'styled-components';

interface RegisterSelectTypeProps {
  details: RegisterDetails;
  onSubmit: (details: RegisterDetails) => void;
  nextStep: () => void;
  prevStep: () => void;
  cancel: () => void;
}

interface FormDataType {
  teams: number;
  children: number;
}

const getEmptyForm = (details: RegisterDetails): FormDataType => ({
  teams: details.teamsImpacted ?? 0,
  children: details.childrenImpacted ?? 0,
});

const GridFormField = styled(FormField)<{ area?: string }>`
  grid-area: ${(props) => props.area};
`;

export function RegisterSelectType(props: RegisterSelectTypeProps) {
  const { details, onSubmit, nextStep, prevStep, cancel } = props;
  const [regType, setRegType] = React.useState<RegistrationType>('NORMAL');
  const [formData, setFormData] = React.useState<FormDataType>(getEmptyForm(details));

  React.useEffect(() => {
    if (details.type) {
      setRegType(details.type);
    }
    setFormData(getEmptyForm(details));
  }, [details]);

  return (
    <Box gap="medium">
      <Text>Vyberte typ registrácie:</Text>

      <RadioButtonGroup
        name="type"
        options={[
          { label: 'normálna', value: 'NORMAL' },
          { label: 'class-pack', value: 'CLASS_PACK' },
        ]}
        value={regType}
        onChange={(event) => setRegType(event.target.value as RegistrationType)}
      />
      <Form
        onChange={setFormData}
        onReset={() => setFormData(getEmptyForm(details))}
        onSubmit={({ value }) => {
          onSubmit({
            ...details,
            type: regType,
            teamsImpacted: Number(value.teams),
            childrenImpacted: Number(value.children),
          });
          nextStep();
        }}
        value={formData}
        messages={{ required: 'Povinný údaj' }}
      >
        <Grid columns={['1fr', '1fr']} gap={{ column: 'medium', row: 'none' }}>
          <GridFormField
            name="teams"
            label={`Počet tímov, ktoré budú používať túto sadu: ${formData.teams}`}
            required
            area="auto / span 2"
          >
            <RangeInput name="teams" min={1} max={10} />
          </GridFormField>
          <GridFormField
            name="children"
            label={`Počet detí, ktoré budú používať túto sadu: ${formData.children}`}
            required
            area="auto / span 2"
          >
            <RangeInput name="children" />
          </GridFormField>
        </Grid>

        <Box justify="between" direction="row">
          <Button label="Späť" onClick={prevStep} />
          <Button plain label="Zrušiť" hoverIndicator onClick={cancel} />
          <Button primary label="Pokračovať" type="submit" />
        </Box>
      </Form>
    </Box>
  );
}
