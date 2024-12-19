import React from 'react';
import { Box, Button, Spinner, Text } from 'grommet';
import { EventListTile } from '../../../components/event-list-tile';
import { EventListFragmentFragment, useGetEventsLazyQuery } from '../../../_generated/graphql';
import { CheckoutDetails } from './types';

interface CheckoutSelectEventProps {
  details: CheckoutDetails;
  ignoreEvents?: string[];
  onSubmit: (event: EventListFragmentFragment) => void;
  nextStep: () => void;
  prevStep: () => void;
  cancel: () => void;
}

export function CheckoutSelectEvent(props: CheckoutSelectEventProps) {
  const { details, onSubmit, nextStep, prevStep, cancel, ignoreEvents = [] } = props;
  const [fetchEvents, { data, loading }] = useGetEventsLazyQuery({
    fetchPolicy: 'network-only',
  });

  React.useEffect(() => {
    if (details.program) {
      fetchEvents({
        variables: { filter: { programId: details.program.id, isActive: true } },
      });
    }
  }, [details.program, fetchEvents]);

  if (loading) {
    return <Spinner />;
  }

  const events = data?.getEvents ?? [];

  const handleSelectEvent = (event: EventListFragmentFragment) => {
    if (
      event.invitationOnly &&
      event.invitedTeamsIds.findIndex((id) => id === details.teamId) === -1
    ) {
      return;
    }
    onSubmit(event);
  };

  return (
    <Box gap="medium">
      <Text>Vyberte turnaj na ktorý sa chcete prihlásiť:</Text>

      {events.map((event) => (
        <EventListTile
          key={event.id}
          event={event}
          onClick={() => handleSelectEvent(event)}
          selected={details.event?.id === event.id}
          disabled={
            (event.maxTeams && event.registrationsCount >= event.maxTeams) ||
            ignoreEvents.find((e) => e === event.id)
              ? true
              : false
          }
          showNotice
        />
      ))}

      <Box justify="between" direction="row">
        <Button label="Späť" onClick={prevStep} />
        <Button plain label="Zrušiť" hoverIndicator onClick={cancel} />
        <Button primary label="Pokračovať" onClick={nextStep} disabled={!details.event?.id} />
      </Box>
    </Box>
  );
}
