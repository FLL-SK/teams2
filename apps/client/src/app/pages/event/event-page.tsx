import { appPath } from '@teams2/common';
import { Box, Spinner, Tag } from 'grommet';
import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { BasePage } from '../../components/base-page';
import { Panel } from '../../components/panel';
import { useGetEventLazyQuery } from '../../generated/graphql';

export function EventPage() {
  const navigate = useNavigate();
  const [getEvent, { data: eventData, loading: eventLoading }] = useGetEventLazyQuery();

  const { id } = useParams();

  useEffect(() => {
    if (id) {
      getEvent({ variables: { id } });
    }
  }, [getEvent, id]);

  if (eventLoading) {
    return <Spinner />;
  } else if (!id || !eventData?.getEvent) {
    navigate(appPath.page404);
  }

  return (
    <BasePage title="Turnaj">
      <Box gap="medium">
        <Panel title="Detaily turnaja">
          <p>Here be details</p>
        </Panel>
        <Panel title="Regitrácie">
          <Box direction="row" wrap>
            {eventData?.getEvent?.teams.map((t) => (
              <Tag key={t.id} onClick={() => navigate(appPath.team(t.id))} value={t.name} />
            ))}
          </Box>
        </Panel>
        <Panel title="Manažéri">
          <Box direction="row" wrap>
            {eventData?.getEvent?.managers.map((m) => (
              <Tag
                key={m.id}
                onClick={() => navigate(appPath.profile(m.id))}
                value={m.name.length > 0 ? m.name : m.username}
              />
            ))}
          </Box>
        </Panel>
      </Box>
    </BasePage>
  );
}
