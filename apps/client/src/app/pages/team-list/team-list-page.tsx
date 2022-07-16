import React from 'react';
import { Box, Button } from 'grommet';
import { useNavigate } from 'react-router-dom';
import { useAppUser } from '../../components/app-user/use-app-user';
import { BasePage } from '../../components/base-page';
import { ErrorPage } from '../../components/error-page';
import { useGetTeamsQuery } from '../../generated/graphql';
import { TeamList } from './components/team-list';
import { Filter } from 'grommet-icons';
import { BaseListPage } from '../../components/base-page-list';

export function TeamListPage() {
  const navigate = useNavigate();
  const { isAdmin } = useAppUser();
  const [selectedTeam, setSelectedTeam] = React.useState<string>();
  const [showFilter, setShowFilter] = React.useState(false);

  const { data: teamsData, loading: teamsLoading, error: teamsError } = useGetTeamsQuery();

  const teams = teamsData?.getTeams ?? [];

  if (teamsError) {
    return <ErrorPage title="Chyba pri získavaní zoznamu tímov." />;
  }

  const rowGetter = (index: number) =>   
    index < teams.length ? teams[index] : null;

  return (
    <BaseListPage title="Tímy" loading={teamsLoading}>
      {isAdmin() && (
          <TeamList
            rowCount={teams.length}
            rowGetter={rowGetter}
            actionPanel={
              <Button
                plain
                icon={<Filter />}
                tip="Filter"
                onClick={() => {
                  setShowFilter(true);
                  setSelectedTeam(undefined);
                }}
              />
            }
            onSelect={(t) => {
              setSelectedTeam(t.id);
              setShowFilter(false);
            }}
          />

      )}
    </BaseListPage>
  );
}
