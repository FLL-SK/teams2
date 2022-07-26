import React from 'react';
import { Box } from 'grommet';
import { useNavigate } from 'react-router-dom';
import { appPath } from '@teams2/common';
import { RegistrationListFragmentFragment } from '../../../generated/graphql';
import { TeamRegistrationTile } from './team-registration-tile';

interface TeamRegistrationsListProps {
  registrations: RegistrationListFragmentFragment[];
}

export function TeamRegistrationsList(props: TeamRegistrationsListProps) {
  const navigate = useNavigate();
  const { registrations } = props;

  return (
    <Box gap="small">
      {registrations.map((reg) => (
        <TeamRegistrationTile key={reg.id} registration={reg} />
      ))}
    </Box>
  );
}
