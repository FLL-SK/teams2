import { appPath } from '@teams2/common';
import { Box, Spinner, Tag } from 'grommet';
import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { BasePage } from '../../components/base-page';
import { Panel } from '../../components/panel';
import { useGetTeamLazyQuery } from '../../generated/graphql';

export function TeamPage() {
  const navigate = useNavigate();
  const [getTeam, { data: teamData, loading: teamLoading }] = useGetTeamLazyQuery();

  const { id } = useParams();

  useEffect(() => {
    if (id) {
      getTeam({ variables: { id } });
    }
  }, [getTeam, id]);

  if (teamLoading) {
    return <Spinner />;
  } else if (!id || !teamData?.getTeam) {
    navigate(appPath.page404);
  }

  return (
    <BasePage title="Tím">
      <Box gap="medium">
        <Panel title="Detaily tímu">
          <p>Here be details</p>
        </Panel>
        <Panel title="Registrácie">
          <Box direction="row" wrap>
            {teamData?.getTeam?.events.map((e) => (
              <Tag key={e.id} onClick={() => navigate(appPath.event(e.id))} value={e.name} />
            ))}
          </Box>
        </Panel>
        <Panel title="Faktúry">
          <p>Here be data</p>
        </Panel>
      </Box>
    </BasePage>
  );
}
