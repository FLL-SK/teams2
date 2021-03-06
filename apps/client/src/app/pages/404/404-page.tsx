import React from 'react';
import { Box, Text, Heading } from 'grommet';
import { BasePage } from '../../components/base-page';

export function Page404() {
  return (
    <BasePage title="Chyba">
      <Box gap="medium">
        <Heading level={2}>Chyba 404</Heading>
        <Text>Stránka alebo údaj nenájdený.</Text>
      </Box>
    </BasePage>
  );
}
