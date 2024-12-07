import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Box, Button, TextInput } from 'grommet';
import { useAppUser } from '../../components/app-user/use-app-user';
import { ErrorPage } from '../../components/error-page';
import { useGetUsersQuery, UserListFragmentFragment } from '../../_generated/graphql';
import { UserList } from './components/user-list';
import { Close, Filter } from 'grommet-icons';
import UserSidebar from './components/user-sidebar';
import { BasePage } from '../../components/base-page';
import { formatFullName } from '../../utils/format-fullname';
import UserListFilter, { UserListFilterValues } from './components/user-list-filter';
import {
  constructUserListSearchParams,
  parseUserListSearchParams,
} from './components/user-list-params';
import { useSearchParams } from 'react-router-dom';
import { useNotification } from '../../components/notifications/notification-provider';

export function UserListPage() {
  const { isAdmin } = useAppUser();
  const { notify } = useNotification();
  const [selectedTeam, setSelectedTeam] = React.useState<string>();
  const [showFilter, setShowFilter] = React.useState(false);
  const [filter, setFilter] = useState<UserListFilterValues>({});

  const [searchParams, setSearchParams] = useSearchParams();

  const {
    data: usersData,
    loading: usersLoading,
    error: usersError,
  } = useGetUsersQuery({
    onError: (e) => notify.error('Nepodarilo sa načítať zoznam používateľov.', e.message),
  });

  const [searchText, setSearchText] = useState('');
  const [searchResults, setSearchResults] = useState<UserListFragmentFragment[]>([]);

  useEffect(() => {
    const flt = parseUserListSearchParams(searchParams);
    setFilter(flt);
  }, [searchParams]);

  const handleApplyFilter = useCallback(
    (filter: UserListFilterValues) => {
      const sp = constructUserListSearchParams(filter);
      setSearchParams(new URLSearchParams(sp));
    },
    [setSearchParams],
  );

  const searchList = useMemo(
    () =>
      (usersData?.getUsers ?? []).map((t) => ({
        text: `${formatFullName(
          t.firstName,
          t.lastName,
        ).toLocaleLowerCase()} ${t.username.toLocaleLowerCase()}`,
        value: t,
      })),
    [usersData],
  );

  const applyFilter = useCallback(
    (text: string, flt: UserListFilterValues) => {
      let r = searchList;
      if (!flt.includeInactive) {
        r = r.filter((s) => !s.value.deletedOn);
      }
      if (flt.isAdmin) {
        r = r.filter((s) => s.value.isAdmin);
      }
      if (flt.isSuperAdmin) {
        r = r.filter((s) => s.value.isSuperAdmin);
      }

      if (text.length !== 0) {
        r = r.filter((item) => item.text.includes(text.toLocaleLowerCase()));
      }

      setSearchResults(r.map((l) => l.value));
    },
    [searchList],
  );

  useEffect(() => {
    applyFilter(searchText, filter);
  }, [searchText, filter, applyFilter]);

  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    applyFilter(searchText, filter);
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
        <UserSidebar
          user={searchList.find((item) => item.value.id === selectedTeam)?.value}
          onClose={() => setSelectedTeam(undefined)}
        />
      )}
      <UserListFilter
        show={showFilter}
        values={filter}
        onChange={handleApplyFilter}
        onClose={() => setShowFilter(false)}
      />
    </BasePage>
  );
}
