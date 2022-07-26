import React from 'react';
import { FormField, Grid, TextInput } from 'grommet';
import styled from 'styled-components';

interface AddressFormProps {
  hideOrgRegistration?: boolean;
  hideContact?: boolean;
}

const GridFormField = styled(FormField)<{ area?: string }>`
  grid-area: ${(props) => props.area};
`;

export function AddressForm(props: AddressFormProps) {
  const { hideContact, hideOrgRegistration } = props;

  return (
    <Grid columns={['1fr', '1fr', '1fr', '1fr']} gap={{ column: 'medium', row: 'none' }}>
      <GridFormField name="name" label="Názov organizácie" required area="auto / span 4">
        <TextInput name="name" />
      </GridFormField>
      <GridFormField name="street" label="Adresa" required area="auto / span 4">
        <TextInput name="street" />
      </GridFormField>
      <GridFormField name="city" label="Mesto" required area="auto / span 4">
        <TextInput name="city" />
      </GridFormField>
      <GridFormField name="zip" label="PSČ" required area="auto / span 2">
        <TextInput name="zip" />
      </GridFormField>
      <GridFormField name="countryCode" label="Štát" area="auto / span 2">
        <TextInput name="countryCode" />
      </GridFormField>

      {!hideOrgRegistration && (
        <>
          <div style={{ gridArea: 'auto / span 4', height: '20px' }} />
          <GridFormField name="companyNumber" label="IČO" area="auto / span 2">
            <TextInput name="companyNumber" />
          </GridFormField>
          <GridFormField name="taxNumber" label="DIČ" area="auto / span 2">
            <TextInput name="taxNumber" />
          </GridFormField>
          <GridFormField name="vatNumber" label="IČ-DPH" area="auto / span 2">
            <TextInput name="vatNumber" />
          </GridFormField>
        </>
      )}

      {!hideContact && (
        <>
          <div style={{ gridArea: 'auto / span 4', height: '20px' }} />
          <GridFormField name="contactName" label="Kontaktná osoba" required area="auto / span 4">
            <TextInput name="contactName" />
          </GridFormField>
          <GridFormField name="email" label="Email" required area="auto / span 4">
            <TextInput name="email" />
          </GridFormField>
          <GridFormField name="phone" label="Telefón" required area="auto / span 4">
            <TextInput name="phone" />
          </GridFormField>
        </>
      )}
    </Grid>
  );
}
