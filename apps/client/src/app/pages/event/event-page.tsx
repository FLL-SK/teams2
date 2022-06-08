import { appPath } from '@teams2/common';
import { Box, Spinner, Tag } from 'grommet';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { BasePage } from '../../components/base-page';
import { Panel } from '../../components/panel';
import { useGetEventLazyQuery } from '../../generated/graphql';

export function EventPage() {
  const navigate = useNavigate();
  const [getEvent, { data: eventData, loading: eventLoading, error: eventError }] =
    useGetEventLazyQuery();
  const [navLink, setNavLink] = useState<string>();

  const { id } = useParams();

  useEffect(() => {
    if (id) {
      getEvent({ variables: { id } });
    }
  }, [getEvent, id]);

  useEffect(() => {
    if (navLink) {
      navigate(navLink);
    }
    return () => {
      setNavLink(undefined);
    };
  }, [navLink, navigate]);

  if ((!id || eventError) && !navLink) {
    setNavLink(appPath.page404);
  }

  return (
    <BasePage title="Turnaj" loading={eventLoading}>
      <Box gap="medium">
        <Panel title="Detaily turnaja">
          <p>Here be details</p>
        </Panel>
        <Panel title="Regitrácie">
          <Box direction="row" wrap>
            {eventData?.getEvent?.teams.map((t) => (
              <Tag key={t.id} onClick={() => setNavLink(appPath.team(t.id))} value={t.name} />
            ))}
          </Box>
        </Panel>
        <Panel title="Manažéri">
          <Box direction="row" wrap>
            {eventData?.getEvent?.managers.map((m) => (
              <Tag
                key={m.id}
                onClick={() => setNavLink(appPath.profile(m.id))}
                value={m.name.length > 0 ? m.name : m.username}
              />
            ))}
          </Box>
        </Panel>
      </Box>
    </BasePage>
  );
}
