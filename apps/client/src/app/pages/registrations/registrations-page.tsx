import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Box, Button, Grid, TextInput } from 'grommet';
import { useAppUser } from '../../components/app-user/use-app-user';
import { ErrorPage } from '../../components/error-page';
import {
  RegistrationTeamFragmentFragment,
  TeamFilterInput,
  useGetProgramRegistrationsLazyQuery,
  useGetProgramsQuery,
} from '../../generated/graphql';
import { RegistrationList } from './components/registration-list';
import { Close, Filter } from 'grommet-icons';
import RegistrationSidebar from './components/registration-sidebar';
import { BasePage } from '../../components/base-page';
import RegistrationListFilter, {
  RegistrationListFilterValues,
} from './components/registration-list-filter';
import { useSearchParams } from 'react-router-dom';
import { ProgramTile } from './components/program-tile';

function parseRegistrationsSearchParams(
  searchParams: URLSearchParams
): RegistrationListFilterValues {
  const values: RegistrationListFilterValues = {};
  if (searchParams.has('t')) {
    values.tags = searchParams.getAll('t');
  }
  if (searchParams.has('p')) {
    values.programId = searchParams.get('p');
  }

  return values;
}

function constructRegistrationsSearchParams(values: RegistrationListFilterValues): URLSearchParams {
  const searchParams = new URLSearchParams();
  if (values.tags) {
    values.tags.forEach((tag) => searchParams.append('t', tag));
  }
  if (values.programId) {
    searchParams.append('p', values.programId);
  }
  return searchParams;
}

export function RegistrationsPage() {
  const { isAdmin } = useAppUser();
  const [selectedTeam, setSelectedTeam] = useState<string>();
  const [showFilter, setShowFilter] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const [filter, setFilter] = useState<RegistrationListFilterValues>({});

  const { data: programsData, loading: programsLoading } = useGetProgramsQuery();

  const [fetchRegistrations, { data: regsData, error: regsDataError, loading: regsLoading }] =
    useGetProgramRegistrationsLazyQuery();

  const [searchText, setSearchText] = useState('');
  const [searchResults, setSearchResults] = useState<RegistrationTeamFragmentFragment[]>([]);

  useEffect(() => {
    const flt = parseRegistrationsSearchParams(searchParams);

    const f: TeamFilterInput = {};
    if (flt.tags) {
      f.hasTags = flt.tags;
    }

    fetchRegistrations({ variables: { programId: flt.programId ?? '0' } });

    setFilter(flt);
  }, [fetchRegistrations, searchParams]);

  const handleApplyFilter = useCallback(
    (filter: RegistrationListFilterValues) => {
      const sp = constructRegistrationsSearchParams(filter);
      setSearchParams(new URLSearchParams(sp));
    },
    [setSearchParams]
  );

  const searchList = useMemo(
    () =>
      (regsData?.getProgramRegistrations ?? []).map((t) => ({
        text: `${t.team.name.toLocaleLowerCase()} ${t.team.address.city.toLocaleLowerCase()}`,
        value: t,
      })),
    [regsData]
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

  if (regsDataError) {
    //return <ErrorPage title="Chyba pri získavaní zoznamu registrácií." />;
  }

  const rowGetter = (index: number) => (index < searchResults.length ? searchResults[index] : null);

  if (!isAdmin) {
    return <ErrorPage title="Nemáte oprávnenie na zobrazenie registrácií." />;
  }

  return (
    <BasePage title="Registrácie" loading={programsLoading}>
      <Grid columns={['1/3', '1/3', '1/3']} gap="small" pad="medium">
        {(programsData?.getPrograms ?? []).map((p) => (
          <ProgramTile
            key={p.id}
            program={p}
            selected={p.id === filter.programId}
            onClick={(prg) => handleApplyFilter({ ...filter, programId: prg.id })}
          />
        ))}
      </Grid>

      <RegistrationList
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
        <RegistrationSidebar
          registration={searchList.find((item) => item.value.id === selectedTeam)?.value}
          onClose={() => setSelectedTeam(undefined)}
        />
      )}
      <RegistrationListFilter
        show={showFilter}
        onClose={() => setShowFilter(false)}
        values={filter}
        onChange={handleApplyFilter}
      />
    </BasePage>
  );
}
