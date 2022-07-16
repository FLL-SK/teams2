import React, { useEffect, useMemo, useState } from 'react';
import { Box, Button, TextInput } from 'grommet';
import { useNavigate } from 'react-router-dom';
import { useAppUser } from '../../components/app-user/use-app-user';
import { ErrorPage } from '../../components/error-page';
import { useGetUsersQuery, UserListFragmentFragment } from '../../generated/graphql';
import { UserList } from './components/user-list';
import { Close, Filter } from 'grommet-icons';
import UserSidebar from './components/user-sidebar';
import { BasePage } from '../../components/base-page';

export function UserListPage() {
  const navigate = useNavigate();
  const { isAdmin } = useAppUser();
  const [selectedTeam, setSelectedTeam] = React.useState<string>();
  const [showFilter, setShowFilter] = React.useState(false);

  const { data: usersData, loading: usersLoading, error: usersError } = useGetUsersQuery();

  const [searchText, setSearchText] = useState('');
  const [searchResults, setSearchResults] = useState<UserListFragmentFragment[]>([]);

  const searchList = useMemo(
    () =>
      (usersData?.getUsers ?? []).map((t) => ({
        text: `${t.name.toLocaleLowerCase()} ${t.username.toLocaleLowerCase()}`,
        value: t,
      })),
    [usersData]
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

  if (usersError) {
    return <ErrorPage title="Chyba pri získavaní zoznamu používateľov." />;
  }

  const rowGetter = (index: number) => (index < searchResults.length ? searchResults[index] : null);

  if (!isAdmin) {
    return <ErrorPage title="Nemáte oprávnenie na zobrazenie používateľov." />;
  }

  return (
    <BasePage title="Používatelia" loading={usersLoading}>
      <UserList
        rowCount={searchResults.length}
        rowGetter={rowGetter}
        actionPanel={
          <Box direction="row">
            <form onSubmit={handleSearchSubmit}>
              <TextInput
                placeholder="Hľadať meno/email používateľa"
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
        <UserSidebar
          user={searchList.find((item) => item.value.id === selectedTeam)?.value}
          onClose={() => setSelectedTeam(undefined)}
        />
      )}
    </BasePage>
  );
}
