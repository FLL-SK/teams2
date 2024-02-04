import React from 'react';
import {
  Box,
  Button,
  Form,
  FormField,
  Grid,
  Paragraph,
  RadioButtonGroup,
  RangeInput,
  Text,
} from 'grommet';

import { Registration, RegistrationInput, RegistrationType } from '../../../_generated/graphql';
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
  setCount: number;
}

const getEmptyForm = (details: RegisterDetails): FormDataType => ({
  teams: details.teamsImpacted ?? 0,
  children: details.childrenImpacted ?? 0,
  setCount: details.setCount ?? 0,
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
          const input: RegisterDetails = { ...details, type: regType };
          if (regType === 'CLASS_PACK') {
            input.teamsImpacted = value.teams;
            input.childrenImpacted = value.children;
            input.setCount = value.setCount;
          }

          onSubmit(input);
          nextStep();
        }}
        value={formData}
        messages={{ required: 'Povinný údaj' }}
      >
        {regType === 'CLASS_PACK' && (
          <Grid columns={['1fr', '1fr']} gap={{ column: 'medium', row: 'none' }}>
            <GridFormField
              name="teams"
              label={`Počet tímov, ktoré sa zapoja do FIRST LEGO League v rámci tejto registrácie: ${formData.teams}`}
              required
              area="auto / span 2"
            >
              <Box pad="small">
                <RangeInput name="teams" min={1} max={10} />
                <Paragraph size="small" fill>
                  Počet tímov, ktoré sa zapoja do FIRST LEGO League v rámci tejto registrácie.
                  Podujatia (turnaja/festivalu) sa môže zúčastniť jeden z týchto tímov.
                </Paragraph>
              </Box>
            </GridFormField>
            <GridFormField
              name="children"
              label={`Počet detí, ktoré sa zapoja do FIRST LEGO League v rámci tejto registrácie: ${formData.children}`}
              required
              area="auto / span 2"
            >
              <Box pad="small">
                <RangeInput name="children" />
                <Paragraph size="small" fill>
                  Počet detí, ktoré sa zapoja do FIRST LEGO League v rámci tejto registrácie.
                  Súťažne sa podujatia (turnaja/festivalu) sa môže zúčastniť iba deti jedného tímu.
                  Nesúťažne môžu prísť všetky.
                </Paragraph>
              </Box>
            </GridFormField>
            <GridFormField
              name="setCount"
              label={`Požadovaný počet súprav: ${formData.setCount}`}
              required
              area="auto / span 2"
            >
              <Box pad="small">
                <RangeInput name="setCount" min={1} max={5} />
                <Paragraph size="small" fill>
                  Počet súprav, ktoré si želáte zakúpiť.
                </Paragraph>
              </Box>
            </GridFormField>
          </Grid>
        )}

        <Box justify="between" direction="row">
          <Button label="Späť" onClick={prevStep} />
          <Button plain label="Zrušiť" hoverIndicator onClick={cancel} />
          <Button primary label="Pokračovať" type="submit" />
        </Box>
      </Form>
    </Box>
  );
}
