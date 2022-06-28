import { Box, Text } from 'grommet';
import React from 'react';
import { BasePage } from '../../components/base-page';
import { EventList } from '../../components/event-list';
import { useGetEventsQuery } from '../../generated/graphql';

interface HomePageProps {
  responsiveSize?: string;
}

export function HomePage(props: HomePageProps) {
  const { data: eventsData, loading: eventsLoading } = useGetEventsQuery({
    variables: { filter: { isActive: true } },
  });

  const events = eventsData?.getEvents ?? [];
  return (
    <BasePage title="Turnaje" loading={eventsLoading}>
      {events.length === 0 && (
        <Box pad="medium">
          <Text>Momentálne nie sú dostupné žiadne turnaje.</Text>
        </Box>
      )}
      <EventList events={events} />
    </BasePage>
  );
}
