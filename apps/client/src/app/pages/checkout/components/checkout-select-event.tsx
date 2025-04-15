import React from 'react';
import { Box, Button, Spinner, Text } from 'grommet';
import { EventListTile } from '../../../components/event-list-tile';
import { EventListFragmentFragment, useGetEventsLazyQuery } from '../../../_generated/graphql';
import { CheckoutDetails } from './types';
import { ColorType } from 'grommet/utils';

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
  const [today] = React.useState(new Date(new Date().setHours(0, 0, 0, 0)).toISOString());

  React.useEffect(() => {
    if (details.program) {
      fetchEvents({
        variables: { filter: { programId: details.program.id, isActive: true } },
      });
    }
  }, [details.program, fetchEvents]);

  const df = React.useCallback(
    (event: EventListFragmentFragment) => {
      if (
        event.invitationOnly &&
        event.invitedTeamsIds.findIndex((id) => id === details.teamId) === -1
      ) {
        return {
          isDisabled: true,
          notice: 'Len na pozvánky',
          color: 'status-warning' as ColorType,
        };
      }

      if (event.registrationEnd && event.registrationEnd < today) {
        return {
          isDisabled: true,
          notice: 'Registrácia skončila',
          color: 'status-warning' as ColorType,
        };
      }

      if (event.maxTeams && event.registrationsCount >= event.maxTeams) {
        return {
          isDisabled: true,
          notice: 'Turnaj je naplnený',
          color: 'status-critical' as ColorType,
        };
      }

      if (event.date && event.date < today) {
        return {
          isDisabled: true,
          notice: 'Turnaj už prebehol',
          color: 'status-warning' as ColorType,
        };
      }

      if (ignoreEvents.find((e) => e === event.id)) {
        return { isDisabled: true, notice: '', color: 'status-ok' as ColorType };
      }

      return { isDisabled: false, notice: '', color: 'status-ok' as ColorType };
    },
    [ignoreEvents, today, details.teamId],
  );

  if (loading) {
    return <Spinner />;
  }

  const events = data?.getEvents ?? [];

  return (
    <Box gap="medium">
      <Text>Vyberte turnaj na ktorý sa chcete registrovať:</Text>

      {events.map((event) => (
        <EventListTile
          key={event.id}
          event={event}
          onClick={() => onSubmit(event)}
          selected={details.event?.id === event.id}
          disabled={df(event).isDisabled}
          showNotice={df(event)}
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
