import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Box, Button, TextInput, Text } from 'grommet';
import { useAppUser } from '../../components/app-user/use-app-user';
import { ErrorPage } from '../../components/error-page';
import {
  RegistrationListFragmentFragment,
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
import { exportRegistrationsForShipping } from '../../utils/export-registrations-for-shipping';
import {
  constructRegistrationsSearchParams,
  parseRegistrationsSearchParams,
} from './components/registration-list-params';

const localStoreFilterEntry = 'registrations-filter';

export function RegistrationsPage() {
  const { isAdmin } = useAppUser();
  const [selectedReg, setSelectedReg] = useState<string>();
  const [showFilter, setShowFilter] = useState(false);

  const [searchParams, setSearchParams] = useSearchParams();
  const [filter, setFilter] = useState<RegistrationListFilterValues>({});

  const [fetchRegistrations, { data: regsData, error: regsDataError, loading: regsLoading }] =
    useGetProgramRegistrationsLazyQuery({ fetchPolicy: 'cache-and-network' });
  const [fetchProgram, { data: progData, error: progDataError, loading: progLoading }] =
    useGetProgramLazyQuery({ fetchPolicy: 'cache-and-network' });

  const [searchText, setSearchText] = useState('');
  const [registrations, setRegistrations] = useState<RegistrationListFragmentFragment[]>([]);

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
    (item: RegistrationListFragmentFragment) => {
      let ok = true;
      if (filter.tags) {
        ok = ok && filter.tags.every((t) => item.team.tags.findIndex((tt) => tt.id === t) > -1);
      }
      if (filter.notConfirmed) {
        ok = ok && !item.confirmedOn;
      }
      if (filter.notInvoiced) {
        ok = ok && !item.invoiceIssuedOn;
      }
      if (filter.notPaid) {
        ok = ok && !item.paidOn;
      }
      if (filter.notShipped) {
        ok = ok && !item.shippedOn;
      }
      if (filter.notConfirmedSize) {
        ok = ok && !item.sizeConfirmedOn;
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
    results.sort((a, b) => a.team.name.localeCompare(b.team.name));
    setRegistrations(results);
  };

  // if no search text, show all teams
  useEffect(() => {
    if (searchText.length === 0) {
      const reg = searchOptions.map((l) => l.value).filter(applyFilter);
      reg.sort((a, b) => a.team.name.localeCompare(b.team.name));
      setRegistrations(reg);
    }
  }, [searchText, searchOptions, applyFilter]);

  // if no searchParams provided for the page, then get filter from the local store
  useEffect(() => {
    const s = localStorage.getItem(localStoreFilterEntry);
    if (searchParams.toString().length === 0 && s) {
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

    if (flt.programId) {
      fetchRegistrations({ variables: { programId: flt.programId } });
    }

    setFilter(flt);
  }, [fetchRegistrations, searchParams]);

  // get registrations for selected program
  useEffect(() => {
    if (filter.programId) {
      fetchProgram({ variables: { id: filter.programId } });
    }
  }, [fetchProgram, filter.programId]);

  // apply filter
  const handleApplyFilter = useCallback(
    (filter: RegistrationListFilterValues) => {
      const sp = constructRegistrationsSearchParams(filter);
      localStorage.setItem(localStoreFilterEntry, sp.toString());
      const p = new URLSearchParams(sp);
      setSearchParams(p);
    },
    [setSearchParams]
  );

  const rowGetter = (index: number) => (index < registrations.length ? registrations[index] : null);

  if (!isAdmin) {
    return <ErrorPage title="Nemáte oprávnenie na zobrazenie registrácií." />;
  }

  return (
    <BasePage
      title={`Registrácie pre ${progData?.getProgram.name ?? ''}`}
      loading={regsLoading || progLoading}
    >
      {!filter.programId && (
        <Text>Najskôr vyberte vo filtri program, pre ktorý sa majú registrácie zobraziť.</Text>
      )}
      {(regsDataError || progDataError) && <Text>Chyba pri získavaní zoznamu registrácií.</Text>}

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
                icon={Object.keys(filter).length > 0 ? <Filter color="red" /> : <Filter />}
                tip="Filter"
                onClick={() => {
                  setShowFilter(true);
                  setSelectedReg(undefined);
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
            setSelectedReg(t.id);
            setShowFilter(false);
          }}
        />
      )}

      {selectedReg && (
        <RegistrationSidebar
          registrationId={selectedReg}
          onClose={() => setSelectedReg(undefined)}
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
