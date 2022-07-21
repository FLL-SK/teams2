import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Box, Button, TextInput, Text } from 'grommet';
import { useAppUser } from '../../components/app-user/use-app-user';
import { ErrorPage } from '../../components/error-page';
import {
  RegistrationTeamFragmentFragment,
  TeamFilterInput,
  useGetProgramLazyQuery,
  useGetProgramRegistrationsLazyQuery,
} from '../../generated/graphql';
import { RegistrationList } from './components/registration-list';
import { Close, Download, Filter } from 'grommet-icons';
import RegistrationSidebar from './components/registration-sidebar';
import { BasePage } from '../../components/base-page';
import RegistrationListFilter, {
  RegistrationListFilterValues,
} from './components/registration-list-filter';
import { useSearchParams } from 'react-router-dom';
import { exportRegistrations } from '../../utils/export-registrations';
import { exportRegistrationsForShipping } from '../../utils/export-registrations-for-shipping';

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

const localStoreFilterEntry = 'registrations-filter';

export function RegistrationsPage() {
  const { isAdmin } = useAppUser();
  const [selectedTeam, setSelectedTeam] = useState<string>();
  const [showFilter, setShowFilter] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const [filter, setFilter] = useState<RegistrationListFilterValues>({});

  const [fetchRegistrations, { data: regsData, error: regsDataError, loading: regsLoading }] =
    useGetProgramRegistrationsLazyQuery();
  const [fetchProgram, { data: progData, error: progDataError, loading: progLoading }] =
    useGetProgramLazyQuery();

  const [searchText, setSearchText] = useState('');
  const [registrations, setRegistrations] = useState<RegistrationTeamFragmentFragment[]>([]);

  // prepare search entries for text search
  const searchOptions = useMemo(
    () =>
      (regsData?.getProgramRegistrations ?? []).map((t) => ({
        text: `${t.team.name.toLocaleLowerCase()} ${t.team.address.city.toLocaleLowerCase()}`,
        value: t,
      })),
    [regsData]
  );

  const applyFilter = useCallback(
    (item: RegistrationTeamFragmentFragment) => {
      let ok = true;
      if (filter.tags) {
        ok = ok && filter.tags.every((t) => item.team.tags.findIndex((tt) => tt.id === t) > -1);
      }
      return ok;
    },
    [filter]
  );

  // apply full text search
  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const results = searchOptions
      .filter((item) => item.text.includes(searchText.toLocaleLowerCase()))
      .map((item) => item.value)
      .filter(applyFilter);
    setRegistrations(results);
  };

  // if no search text, show all teams
  useEffect(() => {
    if (searchText.length === 0) {
      setRegistrations(searchOptions.map((l) => l.value).filter(applyFilter));
    }
  }, [searchText, searchOptions, applyFilter]);

  // if no searchParams provided for the page, then get filter from the local store
  useEffect(() => {
    const s = localStorage.getItem(localStoreFilterEntry);
    if (searchParams.entries.length === 0 && s) {
      setSearchParams(new URLSearchParams(s));
    }
  }, [searchParams, setSearchParams]);

  // process changed searchParams
  useEffect(() => {
    const flt = parseRegistrationsSearchParams(searchParams);

    const f: TeamFilterInput = {};
    if (flt.tags) {
      f.hasTags = flt.tags;
    }

    fetchRegistrations({ variables: { programId: flt.programId ?? '0' } });

    setFilter(flt);
  }, [fetchRegistrations, searchParams]);

  // get registrations for selected program
  useEffect(() => {
    fetchProgram({ variables: { id: filter.programId ?? '0' } });
  }, [fetchProgram, filter.programId]);

  // apply filter
  const handleApplyFilter = useCallback(
    (filter: RegistrationListFilterValues) => {
      const sp = constructRegistrationsSearchParams(filter);
      localStorage.setItem(localStoreFilterEntry, sp.toString());
      setSearchParams(new URLSearchParams(sp));
    },
    [setSearchParams]
  );

  if (regsDataError) {
    //return <ErrorPage title="Chyba pri získavaní zoznamu registrácií." />;
  }

  const rowGetter = (index: number) => (index < registrations.length ? registrations[index] : null);

  if (!isAdmin) {
    return <ErrorPage title="Nemáte oprávnenie na zobrazenie registrácií." />;
  }

  console.log(registrations);

  return (
    <BasePage title={`Registrácie pre ${progData?.getProgram.name ?? ''}`} loading={regsLoading}>
      {!filter.programId && (
        <Text>Najskôr vyberte vo filtri program, pre ktorý sa majú registrácie zobraziť.</Text>
      )}
      {regsDataError && <Text>Chyba pri získavaní zoznamu registrácií.</Text>}

      {filter.programId && (
        <RegistrationList
          rowCount={registrations.length}
          rowGetter={rowGetter}
          actionPanel={
            <Box direction="row" width="100%">
              <Box width="200px">
                <form onSubmit={handleSearchSubmit}>
                  <TextInput
                    placeholder="Hľadať názov tímu/mesto"
                    onChange={({ target }) => setSearchText(target.value)}
                    value={searchText}
                    width="auto"
                  />
                  <button hidden type="submit" />
                </form>
              </Box>
              <Button icon={<Close />} onClick={() => setSearchText('')} />
              <Button
                icon={Object.keys(filter).length === 0 ? <Filter /> : <Filter color="red" />}
                tip="Filter"
                onClick={() => {
                  setShowFilter(true);
                  setSelectedTeam(undefined);
                }}
              />
              <Button
                icon={<Download />}
                tip="Export"
                onClick={() =>
                  exportRegistrationsForShipping(progData?.getProgram.name ?? '', registrations)
                }
              />
            </Box>
          }
          onSelect={(t) => {
            setSelectedTeam(t.id);
            setShowFilter(false);
          }}
        />
      )}

      {selectedTeam && (
        <RegistrationSidebar
          registration={searchOptions.find((item) => item.value.id === selectedTeam)?.value}
          onClose={() => setSelectedTeam(undefined)}
        />
      )}
      <RegistrationListFilter
        show={showFilter || !filter.programId}
        onClose={() => setShowFilter(false)}
        values={filter}
        onChange={handleApplyFilter}
      />
    </BasePage>
  );
}
