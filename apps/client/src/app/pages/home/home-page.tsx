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
  const events = [...(eventsData?.getEvents ?? [])].sort((a, b) =>
    (a.date ?? '') < (b.date ?? '') ? -1 : 1
  );
  return (
    <BasePage title="Turnaje" loading={eventsLoading}>
      <EventList events={events} />
    </BasePage>
  );
}
