import React from 'react';
import { Box, Text } from 'grommet';
import { useMemo } from 'react';
import { useAppUser } from '../../components/app-user/use-app-user';
import { BasePage } from '../../components/base-page';
import { PanelGroup } from '../../components/panel';

import { useGetProgramQuery } from '../../generated/graphql';
import { ErrorPage } from '../../components/error-page';
import { useParams } from 'react-router-dom';

import { PanelProgramDetails } from './components/panel-program-details';
import { PanelProgramFees } from './components/panel-program-fees';
import { PanelProgramEvents } from './components/panel-program-events';
import { PanelProgramFiles } from './components/panel-program-files';
import { PanelProgramManagers } from './components/panel-program-managers';

export function ProgramPage() {
  const { id } = useParams();

  const {
    data: programData,
    loading: programLoading,
    error,
    refetch: programRefetch,
  } = useGetProgramQuery({ variables: { id: id ?? '0' } });

  const { isProgramManager, isAdmin } = useAppUser();

  const program = programData?.getProgram;
  const canEdit: boolean = useMemo(
    () => (isProgramManager(program?.id) || isAdmin()) && !program?.deletedOn,
    [isAdmin, isProgramManager, program?.deletedOn, program?.id]
  );
  const canAddManagers: boolean = isProgramManager(program?.id) || isAdmin();

  if (!id || (error && !programLoading)) {
    return <ErrorPage title="Chyba pri získavaní údajov o programe" />;
  }

  return (
    <BasePage title="Program" loading={programLoading}>
      {program?.deletedOn && (
        <Box pad="medium">
          <Text weight="bold" color="red">
            Program bol zrušený
          </Text>
        </Box>
      )}
      <PanelGroup>
        <PanelProgramDetails program={program} canEdit={canEdit} />
        <PanelProgramFiles program={program} canEdit={canEdit} />

        {canEdit && (
          <PanelProgramFees program={program} canEdit={canEdit} onUpdate={() => programRefetch()} />
        )}

        {canEdit && <PanelProgramManagers program={program} canAddManagers={canAddManagers} />}

        <PanelProgramEvents program={program} canEdit={canEdit} onUpdate={() => programRefetch()} />
      </PanelGroup>
    </BasePage>
  );
}
