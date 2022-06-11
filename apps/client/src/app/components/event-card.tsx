import { appPath } from '@teams2/common';
import { formatDate } from '@teams2/dateutils';
import { Text } from 'grommet';
import { useNavigate } from 'react-router-dom';

import { EventListFragmentFragment } from '../generated/graphql';
import { ListRow } from './list-row';

interface EventCardProps {
  event: EventListFragmentFragment;
}

export function EventCard(props: EventCardProps) {
  const { event } = props;
  const navigate = useNavigate();
  return (
    <ListRow columns="1fr 150px 50px" onClick={() => navigate(appPath.event(event.id))} pad="small">
      <Text>{event.name}</Text>
      <Text>{formatDate(event.date)}</Text>
      <Text>{event.teamsIds.length}</Text>
    </ListRow>
  );
}
