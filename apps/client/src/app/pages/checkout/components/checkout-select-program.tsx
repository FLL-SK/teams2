import React from 'react';
import { Box, Button, Spinner, Text } from 'grommet';
import { ProgramTile } from './program-tile';
import { ProgramListFragmentFragment, useGetProgramsQuery } from '../../../_generated/graphql';
import { CheckoutDetails } from './types';

interface CheckoutSelectProgramProps {
  details: CheckoutDetails;
  onSubmit: (program: ProgramListFragmentFragment) => void;
  ignorePrograms?: string[];
  nextStep: () => void;
  prevStep: () => void;
  cancel: () => void;
}

export function CheckoutSelectProgram(props: CheckoutSelectProgramProps) {
  const { details, onSubmit, nextStep, prevStep, cancel, ignorePrograms = [] } = props;
  const { data, loading } = useGetProgramsQuery({ variables: { filter: { isActive: true } } });

  if (loading) {
    return <Spinner />;
  }

  const programs = data?.getPrograms ?? [];

  return (
    <Box gap="medium">
      <Text>Vyberte program, do ktorého sa chcete prihlásiť:</Text>

      {programs.map((program) => (
        <ProgramTile
          key={program.id}
          program={program}
          onClick={() => onSubmit(program)}
          selected={details.program?.id === program.id}
          disabled={
            (program.maxTeams && program.regCount >= program.maxTeams) ||
            ignorePrograms.find((p) => p === program.id)
              ? true
              : false
          }
          showNotice
        />
      ))}
      <Box justify="between" direction="row">
        <Button label="Späť" onClick={prevStep} />
        <Button plain label="Zrušiť" hoverIndicator onClick={cancel} />
        <Button primary label="Pokračovať" onClick={nextStep} disabled={!details.program?.id} />
      </Box>
    </Box>
  );
}
