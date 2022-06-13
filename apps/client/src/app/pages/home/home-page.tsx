import { BasePage } from '../../components/base-page';
import { EventsList } from '../../components/events-list';
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
      <EventsList events={events} />
    </BasePage>
  );
}
