import React from 'react';
import { Box } from 'grommet';
import { TeamRegistrationFragmentFragment } from '../../../generated/graphql';
import { TeamRegistrationTile } from './team-registration-tile';

interface TeamRegistrationsListProps {
  registrations: TeamRegistrationFragmentFragment[];
}

export function TeamRegistrationsList(props: TeamRegistrationsListProps) {
  const { registrations } = props;

  return (
    <Box gap="small">
      {registrations.map((reg) => (
        <TeamRegistrationTile key={reg.id} registration={reg} />
      ))}
    </Box>
  );
}
