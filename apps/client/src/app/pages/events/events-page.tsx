import { Box, Paragraph } from 'grommet';
import React from 'react';
import { BasePage } from '../../components/base-page';
import { EventList } from '../../components/event-list';
import {
  GetEventsDocument,
  GetEventsQuery,
  GetEventsQueryVariables,
} from '../../_generated/graphql';
import { useNotification } from '../../components/notifications/notification-provider';
import { useQuery } from '@apollo/client/react';

interface EventsPageProps {
  responsiveSize?: string;
}

export function EventsPage(props: EventsPageProps) {
  const { notify } = useNotification();
  const {
    data: eventsData,
    loading: eventsLoading,
    error: eventsError,
  } = useQuery<GetEventsQuery, GetEventsQueryVariables>(GetEventsDocument, {
    variables: { filter: { isActive: true } },
  });

  const events = eventsData?.getEvents;

  return (
    <BasePage title="Turnaje" loading={eventsLoading}>
      {eventsError && (
        <Box pad="medium">
          <Paragraph>Pri načítaní turnajov nastala chyba: {eventsError.message}</Paragraph>
        </Box>
      )}
      {!eventsError && events && events.length === 0 && (
        <Box pad="medium">
          <Paragraph>Aktuálne ešte nie sú aktívne žiadne turnaje.</Paragraph>
        </Box>
      )}
      <EventList events={events} />
    </BasePage>
  );
}
