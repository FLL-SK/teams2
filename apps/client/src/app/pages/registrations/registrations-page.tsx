import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Box, Button, TextInput, Text } from 'grommet';
import { useAppUser } from '../../components/app-user/use-app-user';
import { ErrorPage } from '../../components/error-page';
import {
  RegistrationListFragmentFragment,
  TeamFilterInput,
  useAddTagsToTeamMutation,
  useGetProgramLazyQuery,
  useGetProgramRegistrationsLazyQuery,
  useRemoveTagsFromTeamMutation,
} from '../../_generated/graphql';
import { RegistrationList } from './components/registration-list';
import { Close, Deliver, Download, Filter, Group, Tag } from 'grommet-icons';
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
import { MultitagPanel } from './components/multitag-panel';
import { Modal } from '../../components/modal';
import { handleExportRegisteredTeams } from './components/handle-export-regs';
import { useNotification } from '../../components/notifications/notification-provider';

const localStoreFilterEntry = 'registrations-filter';

export function RegistrationsPage() {
  const { isAdmin } = useAppUser();
  const { notify } = useNotification();
  const [selectedReg, setSelectedReg] = useState<string>();
  const [showFilter, setShowFilter] = useState(false);
  const [showCoachesEmails, setShowCoachesEmails] = useState(false);

  const [searchParams, setSearchParams] = useSearchParams();
  const [filter, setFilter] = useState<RegistrationListFilterValues>({});

  const [fetchRegistrations, { data: regsData, error: regsDataError, loading: regsLoading }] =
    useGetProgramRegistrationsLazyQuery({
      fetchPolicy: 'cache-and-network',
      onError: (e) => notify.error('Nepodarilo sa získať zoznam registrácií.', e.message),
    });
  const [fetchProgram, { data: progData, error: progDataError, loading: progLoading }] =
    useGetProgramLazyQuery({ fetchPolicy: 'cache-and-network' });

  const [searchText, setSearchText] = useState('');
  const [registrations, setRegistrations] = useState<RegistrationListFragmentFragment[]>([]);

  const [showMultiTag, setShowMultiTag] = useState(false);

  const [showTeamSelect, setShowTeamSelect] = useState(false);
  const [selectedTeamIds, setSelectedTeamIds] = useState<string[]>([]);

  const [removeTags] = useRemoveTagsFromTeamMutation();
  const [addTags] = useAddTagsToTeamMutation();

  const coachesEmails: string[] = useMemo(
    () =>
      registrations
        ? registrations.reduce((t: string[], reg) => {
            const c = (reg?.team.coaches ?? [])
              .map((c) => c.username)
              .filter((c) => !t.includes(c));
            return [...t, ...c];
          }, [])
        : [],
    [registrations],
  );

  // prepare search entries for text search
  const searchOptions = useMemo(
    () =>
      (regsData?.getProgramRegistrations ?? []).map((t) => ({
        text: `${t.team.name.toLocaleLowerCase()} ${t.team.address.city.toLocaleLowerCase()}`,
        value: t,
      })),
    [regsData],
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
      if (filter.regType === 'prog') {
        ok = ok && !item.eventId;
      }
      if (filter.regType === 'event') {
        ok = ok && !!item.eventId;
      }
      return ok;
    },
    [filter],
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
    [setSearchParams],
  );

  const handleSelectTeam = useCallback(
    (teamId: string) => {
      const i = selectedTeamIds.findIndex((t) => t === teamId);
      if (i > -1) {
        setSelectedTeamIds(selectedTeamIds.filter((t) => t !== teamId));
      } else {
        setSelectedTeamIds([...selectedTeamIds, teamId]);
      }
    },

    [selectedTeamIds],
  );

  useEffect(() => {
    setShowTeamSelect(showMultiTag);
  }, [showMultiTag]);

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
          selectTeams={{ show: showTeamSelect, teams: selectedTeamIds, onSelect: handleSelectTeam }}
          actionPanel={
            <Box>
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
                  icon={<Deliver />}
                  tip="Export údajov pre doručenie"
                  onClick={() =>
                    exportRegistrationsForShipping(progData?.getProgram.name ?? '', registrations)
                  }
                />

                <Button
                  icon={<Group />}
                  tip="Export tímov"
                  onClick={() =>
                    handleExportRegisteredTeams(
                      progData?.getProgram.name ?? '',
                      registrations ?? [],
                    )
                  }
                />

                <Button icon={<Tag />} tip="Tagy" onClick={() => setShowMultiTag(!showMultiTag)} />
              </Box>
              {showMultiTag && (
                <Box direction="row">
                  <MultitagPanel
                    onAdd={async (tagIds) => {
                      for (const teamId of selectedTeamIds) {
                        await addTags({ variables: { teamId, tagIds } });
                      }
                    }}
                    onRemove={async (tagIds) => {
                      for (const teamId of selectedTeamIds) {
                        await removeTags({ variables: { teamId, tagIds } });
                      }
                    }}
                  />
                </Box>
              )}
            </Box>
          }
          onClick={(t) => {
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
      <Modal
        title="Emaily trénerov"
        show={showCoachesEmails}
        onClose={() => setShowCoachesEmails(false)}
        height="medium"
        width="medium"
      >
        <Box overflow={{ vertical: 'auto' }}>
          {coachesEmails.map((email, idx) => (
            <Text key={idx}>{email}</Text>
          ))}
        </Box>
      </Modal>
    </BasePage>
  );
}
