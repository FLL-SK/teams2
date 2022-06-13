import { Box, Button, Spinner, Text } from 'grommet';
import { EventListTile } from '../../../components/event-list-tile';
import {
  EventListFragmentFragment,
  TeamFragmentFragment,
  useGetEventsQuery,
} from '../../../generated/graphql';
import { RegisterDetails } from './types';

interface RegisterSelectEventProps {
  team?: TeamFragmentFragment;
  details: RegisterDetails;
  onSubmit: (event: EventListFragmentFragment) => void;
  nextStep: () => void;
  prevStep: () => void;
  cancel: () => void;
}

export function RegisterSelectEvent(props: RegisterSelectEventProps) {
  const { team, details, onSubmit, nextStep, prevStep, cancel } = props;
  const { data, loading } = useGetEventsQuery({
    variables: { filter: { programId: details.program?.id ?? '0', isActive: true } },
  });

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
