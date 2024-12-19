import React, { useMemo } from 'react';
import { Box } from 'grommet';
import { TeamRegistrationFragmentFragment } from '../../../_generated/graphql';
import { ProgramRegistrationTile } from './program-registration-tile';

interface TeamRegistrationsListProps {
  registrations: TeamRegistrationFragmentFragment[];
  includeInactive?: boolean;
}

export function TeamRegistrationsList(props: TeamRegistrationsListProps) {
  const { registrations, includeInactive } = props;
  const today = useMemo(() => new Date().toISOString().substring(0, 10), []);

  const progRegs = useMemo(
    // get only program registrations
    () =>
      registrations.filter(
        (reg) =>
          !reg.eventId && !reg.canceledOn && (includeInactive || reg.program?.endDate >= today),
      ),
    [includeInactive, registrations, today],
  );

  return (
    <Box gap="small">
      {progRegs.map((reg) => (
        <ProgramRegistrationTile
          key={reg.id}
          registration={reg}
          eventRegistrations={registrations.filter(
            (r) =>
              r.programId === reg.programId &&
              !!r.eventId &&
              !r.canceledOn &&
              (includeInactive || (r.event?.date ?? '9999') >= today),
          )}
        />
      ))}
    </Box>
  );
}
