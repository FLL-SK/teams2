import React from 'react';
import { Box, Button, Spinner, Text } from 'grommet';
import { ProgramTile } from './program-tile';
import {
  ProductFragment,
  TeamFragmentFragment,
  useGetProductsQuery,
} from '../../../_generated/graphql';
import { CheckoutDetails } from './types';
import { ProductTile } from './product-tile';

interface CheckoutSelectProductProps {
  team: TeamFragmentFragment;
  details: CheckoutDetails;
  onSubmit: (product: ProductFragment) => void;
  nextStep: () => void;
  prevStep: () => void;
  cancel: () => void;
}

export function CheckoutSelectProduct(props: CheckoutSelectProductProps) {
  const { details, onSubmit, nextStep, prevStep, cancel, team } = props;
  const { data, loading } = useGetProductsQuery({ variables: { teamId: team.id } });

  if (loading) {
    return <Spinner />;
  }

  const products = data?.getProducts ?? [];

  return (
    <Box gap="medium">
      <Text>Vyberte si registráciu:</Text>

      {products.map((product) => (
        <ProductTile key={product.id} product={product} onSelect={onSubmit} />
      ))}

      <Box justify="between" direction="row">
        <Button label="Späť" onClick={prevStep} />
        <Button plain label="Zrušiť" hoverIndicator onClick={cancel} />
        <Button primary label="Pokračovať" onClick={nextStep} disabled={!details.program?.id} />
      </Box>
    </Box>
  );
}
