import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Box, Button, TextInput } from 'grommet';
import { useAppUser } from '../../components/app-user/use-app-user';
import { ErrorPage } from '../../components/error-page';
import {
  TeamFilterInput,
  TeamListFragmentFragment,
  useGetTeamsLazyQuery,
} from '../../generated/graphql';
import { TeamList } from './components/team-list';
import { Close, Filter } from 'grommet-icons';
import TeamSidebar from './components/team-sidebar';
import { BasePage } from '../../components/base-page';
import TeamListFilter, { TeamListFilterValues } from './components/team-list-filter';
import { useSearchParams } from 'react-router-dom';
import {
  constructTeamListSearchParams,
  parseTeamListSearchParams,
} from './components/team-list-params';

export function TeamListPage() {
  const { isAdmin } = useAppUser();
  const [selectedTeam, setSelectedTeam] = useState<string>();
  const [showFilter, setShowFilter] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const [filter, setFilter] = useState<TeamListFilterValues>({});

  const [fetchTeams, { data: teamsData, error: teamsDataError, loading: teamsLoading }] =
    useGetTeamsLazyQuery();

  const [searchText, setSearchText] = useState('');
  const [searchResults, setSearchResults] = useState<TeamListFragmentFragment[]>([]);

  useEffect(() => {
    const flt = parseTeamListSearchParams(searchParams);

    const f: TeamFilterInput = {};
    if (flt.tags) {
      f.hasTags = flt.tags;
    }
    if (flt.includeInactive) {
      f.includeInactive = flt.includeInactive;
    }

    fetchTeams({ variables: { filter: f } });
    setFilter(flt);
  }, [fetchTeams, searchParams]);

  const handleApplyFilter = useCallback(
    (filter: TeamListFilterValues) => {
      const sp = constructTeamListSearchParams(filter);
      setSearchParams(new URLSearchParams(sp));
    },
    [setSearchParams]
  );

  const searchList = useMemo(
    () =>
      (teamsData?.getTeams ?? []).map((t) => ({
        text: `${t.name.toLocaleLowerCase()} ${t.address.city.toLocaleLowerCase()}`,
        value: t,
      })),
    [teamsData]
  );

  useEffect(() => {
    if (searchText.length === 0) {
      setSearchResults(searchList.map((l) => l.value));
    }
  }, [searchText, searchList]);

  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const results = searchList
      .filter((item) => item.text.includes(searchText.toLocaleLowerCase()))
      .map((item) => item.value);
    setSearchResults(results);
  };

  if (teamsDataError) {
    return <ErrorPage title="Chyba pri získavaní zoznamu tímov." />;
  }

  const rowGetter = (index: number) => (index < searchResults.length ? searchResults[index] : null);

  if (!isAdmin) {
    return <ErrorPage title="Nemáte oprávnenie na zobrazenie tímov." />;
  }

  return (
    <BasePage title="Tímy" loading={teamsLoading}>
      <TeamList
        rowCount={searchResults.length}
        rowGetter={rowGetter}
        actionPanel={
          <Box direction="row" width="100%">
            <form onSubmit={handleSearchSubmit}>
              <TextInput
                placeholder="Hľadať názov tímu/mesto"
                onChange={({ target }) => setSearchText(target.value)}
                value={searchText}
                width="auto"
              />
              <button hidden type="submit" />
            </form>
            <Button icon={<Close />} onClick={() => setSearchText('')} />
            <Button
              plain
              icon={Object.keys(filter).length === 0 ? <Filter /> : <Filter color="red" />}
              tip="Filter"
              onClick={() => {
                setShowFilter(true);
                setSelectedTeam(undefined);
              }}
            />
          </Box>
        }
        onSelect={(t) => {
          setSelectedTeam(t.id);
          setShowFilter(false);
        }}
      />
      {selectedTeam && (
        <TeamSidebar
          team={searchList.find((item) => item.value.id === selectedTeam)?.value}
          onClose={() => setSelectedTeam(undefined)}
        />
      )}
      <TeamListFilter
        show={showFilter}
        onClose={() => setShowFilter(false)}
        values={filter}
        onChange={handleApplyFilter}
      />
    </BasePage>
  );
}
