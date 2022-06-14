import React from 'react';
import { Box, Heading, Text } from 'grommet';
import { BasePage } from './base-page';

interface ErrorPage {
  error?: Error;
  title: string;
}

export function ErrorPage(props: ErrorPage) {
  const { error, title } = props;
  return (
    <BasePage title="Chyba">
      <Box gap="medium">
        <Heading level={2}>{title}</Heading>
        <Text>{error?.message}</Text>
      </Box>
    </BasePage>
  );
}
