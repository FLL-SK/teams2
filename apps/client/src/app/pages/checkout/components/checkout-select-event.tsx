import React from 'react';
import { Box, Button, Spinner, Text } from 'grommet';
import { EventListTile } from '../../../components/event-list-tile';
import { EventListFragmentFragment, useGetEventsLazyQuery } from '../../../_generated/graphql';
import { CheckoutDetails } from './types';
import { is } from 'date-fns/locale';

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
  const [today] = React.useState(new Date().toISOString());

  React.useEffect(() => {
    if (details.program) {
      fetchEvents({
        variables: { filter: { programId: details.program.id, isActive: true } },
      });
    }
  }, [details.program, fetchEvents]);

  const isDisabled = React.useCallback(
    (event: EventListFragmentFragment) => {
      const d =
        // check if event is full
        (event.maxTeams && event.registrationsCount >= event.maxTeams) ||
        // check if event is in the past
        (event.date && event.date < today) ||
        // check if event is invitation only and team is not invited
        (event.invitationOnly &&
          event.invitedTeamsIds.findIndex((id) => id === details.teamId) === -1) ||
        // check if event is in ignore list
        ignoreEvents.find((e) => e === event.id)
          ? true
          : false;
      return d;
    },
    [ignoreEvents, today, details.teamId],
  );

  if (loading) {
    return <Spinner />;
  }

  const events = data?.getEvents ?? [];

  return (
    <Box gap="medium">
      <Text>Vyberte turnaj na ktorý sa chcete prihlásiť:</Text>

      {events.map((event) => (
        <EventListTile
          key={event.id}
          event={event}
          onClick={() => onSubmit(event)}
          selected={details.event?.id === event.id}
          disabled={isDisabled(event)}
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
