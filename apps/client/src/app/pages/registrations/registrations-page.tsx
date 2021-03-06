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
  if (searchParams.has('sg')) {
    values.shipmentGroup = searchParams.get('sg');
  }
  if (searchParams.has('ni')) {
    values.notInvoiced = searchParams.get('ni') === 'true';
  }
  if (searchParams.has('np')) {
    values.notPaid = searchParams.get('np') === 'true';
  }
  if (searchParams.has('ns')) {
    values.notShipped = searchParams.get('ns') === 'true';
  }
  if (searchParams.has('nc')) {
    values.notConfirmedSize = searchParams.get('nc') === 'true';
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
  if (values.shipmentGroup) {
    searchParams.append('sg', values.shipmentGroup);
  }
  if (values.notInvoiced) {
    searchParams.append('ni', 'true');
  }
  if (values.notPaid) {
    searchParams.append('np', 'true');
  }
  if (values.notShipped) {
    searchParams.append('ns', 'true');
  }
  if (values.notConfirmedSize) {
    searchParams.append('nc', 'true');
  }

  return searchParams;
}

const localStoreFilterEntry = 'registrations-filter';

export function RegistrationsPage() {
  const { isAdmin } = useAppUser();
  const [selectedReg, setSelectedReg] = useState<string>();
  const [showFilter, setShowFilter] = useState(false);

  const [searchParams, setSearchParams] = useSearchParams();
  const [filter, setFilter] = useState<RegistrationListFilterValues>({});

  const [
    fetchRegistrations,
    { data: regsData, error: regsDataError, loading: regsLoading, refetch: regsRefetch },
  ] = useGetProgramRegistrationsLazyQuery();
  const [fetchProgram, { data: progData, error: progDataError, loading: progLoading }] =
    useGetProgramLazyQuery();

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

    if (flt.programId) {
      fetchRegistrations({ variables: { programId: flt.programId ?? '0' } });
    }

    setFilter(flt);
  }, [fetchRegistrations, searchParams]);

  // get registrations for selected program
  useEffect(() => {
    if (filter.programId) {
      fetchProgram({ variables: { id: filter.programId ?? '0' } });
    }
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

  const rowGetter = (index: number) => (index < registrations.length ? registrations[index] : null);

  if (!isAdmin) {
    return <ErrorPage title="Nem??te opr??vnenie na zobrazenie registr??ci??." />;
  }

  return (
    <BasePage
      title={`Registr??cie pre ${progData?.getProgram.name ?? ''}`}
      loading={regsLoading || progLoading}
    >
      {!filter.programId && (
        <Text>Najsk??r vyberte vo filtri program, pre ktor?? sa maj?? registr??cie zobrazi??.</Text>
      )}
      {(regsDataError || progDataError) && <Text>Chyba pri z??skavan?? zoznamu registr??ci??.</Text>}

      {filter.programId && (
        <RegistrationList
          rowCount={registrations.length}
          rowGetter={rowGetter}
          actionPanel={
            <Box direction="row" width="100%">
              <Box width="200px">
                <form onSubmit={handleSearchSubmit}>
                  <TextInput
                    placeholder="H??ada?? n??zov t??mu/mesto"
                    onChange={({ target }) => setSearchText(target.value)}
                    value={searchText}
                    width="auto"
                  />
                  <button hidden type="submit" />
                </form>
              </Box>
              <Button icon={<Close />} onClick={() => setSearchText('')} />
              <Button
                icon={Object.keys(filter).length > 1 ? <Filter color="red" /> : <Filter />}
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
