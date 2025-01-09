import { Box, Paragraph } from 'grommet';
import React from 'react';
import { BasePage } from '../../components/base-page';
import { EventList } from '../../components/event-list';
import { useGetEventsQuery } from '../../_generated/graphql';
import { useNotification } from '../../components/notifications/notification-provider';

interface EventsPageProps {
  responsiveSize?: string;
}

export function EventsPage(props: EventsPageProps) {
  const { notify } = useNotification();
  const { data: eventsData, loading: eventsLoading } = useGetEventsQuery({
    variables: { filter: { isActive: true } },
    onError: (e) => notify.error('Nepodarilo sa načítať zoznam turnajov.', e.message),
  });

  const events = eventsData?.getEvents ?? [];

  return (
    <BasePage title="Turnaje" loading={eventsLoading}>
      {events.length === 0 && (
        <Box pad="medium">
          <Paragraph>Aktuálne ešte nie sú aktívne žiadne turnaje.</Paragraph>
        </Box>
      )}
      <EventList events={events} />
    </BasePage>
  );
}
