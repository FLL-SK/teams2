import { appPath } from '@teams2/common';
import { Box, Spinner, Tag } from 'grommet';
import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { BasePage } from '../../components/base-page';
import { Panel } from '../../components/panel';
import { useGetUserLazyQuery } from '../../generated/graphql';

export function ProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [getProfile, { data, loading }] = useGetUserLazyQuery();

  useEffect(() => {
    if (id) {
      getProfile({ variables: { id } });
    }
  }, [getProfile, id]);

  if (loading) {
    return <Spinner />;
  } else {
    if (!id || !data?.getUser) {
      navigate(appPath.page404);
    }
  }

  return (
    <BasePage title="Profil">
      <Box gap="medium">
        <Panel title="Detaily používateľa">
          <p>{data?.getUser?.name}</p>
          <p>{data?.getUser?.username}</p>
        </Panel>
        <Panel title="Moje tímy">
          <Box direction="row" wrap>
            {data?.getUser?.coachingTeams.map((t) => (
              <Tag key={t.id} onClick={() => navigate(appPath.team(t.id))} value={t.name} />
            ))}
          </Box>
        </Panel>
        {!!data?.getUser?.managingEvents.length && (
          <Panel title="Moje turnaje">
            <Box direction="row" wrap>
              {data?.getUser?.managingEvents.map((e) => (
                <Tag key={e.id} onClick={() => navigate(appPath.event(e.id))} value={e.name} />
              ))}
            </Box>
          </Panel>
        )}
      </Box>
    </BasePage>
  );
}
