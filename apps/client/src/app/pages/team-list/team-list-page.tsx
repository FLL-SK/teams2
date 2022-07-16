import React, { useEffect, useMemo, useState } from 'react';
import { Box, Button, TextInput } from 'grommet';
import { useNavigate } from 'react-router-dom';
import { useAppUser } from '../../components/app-user/use-app-user';
import { ErrorPage } from '../../components/error-page';
import { TeamListFragmentFragment, useGetTeamsQuery } from '../../generated/graphql';
import { TeamList } from './components/team-list';
import { Close, Filter } from 'grommet-icons';
import TeamSidebar from './components/team-sidebar';
import { BasePage } from '../../components/base-page';

export function TeamListPage() {
  const navigate = useNavigate();
  const { isAdmin } = useAppUser();
  const [selectedTeam, setSelectedTeam] = React.useState<string>();
  const [showFilter, setShowFilter] = React.useState(false);

  const { data: teamsData, loading: teamsLoading, error: teamsError } = useGetTeamsQuery();

  const [searchText, setSearchText] = useState('');
  const [searchResults, setSearchResults] = useState<TeamListFragmentFragment[]>([]);

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

  if (teamsError) {
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
          <Box direction="row">
            <form onSubmit={handleSearchSubmit}>
              <TextInput
                placeholder="Hľadať názov tímu/mesto"
                onChange={({ target }) => setSearchText(target.value)}
                value={searchText}
              />
              <button hidden type="submit" />
            </form>
            <Button icon={<Close />} onClick={() => setSearchText('')} />
            <Button
              plain
              icon={<Filter />}
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
    </BasePage>
  );
}
