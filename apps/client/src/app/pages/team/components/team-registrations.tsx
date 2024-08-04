import React, { useMemo } from 'react';
import { Box } from 'grommet';
import { TeamRegistrationFragmentFragment } from '../../../_generated/graphql';
import { TeamRegistrationTile } from './team-registration-tile';

interface TeamRegistrationsListProps {
  registrations: TeamRegistrationFragmentFragment[];
  includeInactive?: boolean;
}

export function TeamRegistrationsList(props: TeamRegistrationsListProps) {
  const { registrations, includeInactive } = props;
  const today = useMemo(() => new Date().toISOString().substring(0, 10), []);
  const regs = useMemo(
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
      {regs.map((reg) => (
        <TeamRegistrationTile key={reg.id} registration={reg} allRegistrations={registrations} />
      ))}
    </Box>
  );
}
