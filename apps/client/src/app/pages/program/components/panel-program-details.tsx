import { formatDate } from '@teams2/dateutils';
import { Anchor, Box, Button, Markdown } from 'grommet';
import React, { useState } from 'react';
import { EditProgramDialog } from '../../../components/dialogs/edit-program-dialog';
import { LabelValue } from '../../../components/label-value';
import { LabelValueGroup } from '../../../components/label-value-group';
import { Modal } from '../../../components/modal';
import { useNotification } from '../../../components/notifications/notification-provider';
import { Panel } from '../../../components/panel';
import { ProgramFragmentFragment, useUpdateProgramMutation } from '../../../generated/graphql';

interface PanelProgramDetailsProps {
  program?: ProgramFragmentFragment;
  canEdit: boolean;
}

export function PanelProgramDetails(props: PanelProgramDetailsProps) {
  const { program, canEdit } = props;

  const [showProgramEditDialog, setShowProgramEditDialog] = useState(false);
  const [showProgramTerms, setShowProgramTerms] = useState(false);

  const { notify } = useNotification();

  const [updateProgram] = useUpdateProgramMutation({
    onError: () => notify.error('Nepodarilo sa aktualizovať program'),
  });

  if (!program) {
    return null;
  }

  return (
    <Panel title="Detaily programu" gap="medium">
      <LabelValueGroup labelWidth="150px" direction="row" gap="small">
        <LabelValue label="Názov" value={program?.name} />
        <LabelValue
          label="Začiatok"
          value={program?.startDate ? formatDate(program?.startDate) : 'neurčený'}
        />
        <LabelValue
          label="Koniec"
          value={program?.endDate ? formatDate(program?.endDate) : 'neurčený'}
        />
        <LabelValue label="Popis">
          <Box
            background="light-2"
            flex
            pad="small"
            height={{ max: '200px' }}
            overflow={{ vertical: 'auto' }}
          >
            <Markdown>{program?.description ?? ''}</Markdown>
          </Box>
        </LabelValue>
        <LabelValue label="Podmienky">
          <Box background="light-2" flex pad="small">
            <Box flex height={{ max: '200px' }} overflow={{ vertical: 'auto' }}>
              <Markdown>{program?.conditions ?? ''}</Markdown>
            </Box>
            <Anchor label="Zobraz" onClick={() => setShowProgramTerms(true)} />
          </Box>
        </LabelValue>
      </LabelValueGroup>
      {canEdit && (
        <Box direction="row">
          <Button
            label="Zmeniť"
            onClick={() => setShowProgramEditDialog(true)}
            disabled={!canEdit}
          />
        </Box>
      )}

      <EditProgramDialog
        show={showProgramEditDialog}
        program={program}
        onClose={() => setShowProgramEditDialog(false)}
        onSubmit={(values) => updateProgram({ variables: { id: program.id, input: values } })}
      />

      <Modal
        show={showProgramTerms}
        title="Podmienky programu"
        onClose={() => setShowProgramTerms(false)}
        width="100vw"
        height="100vh"
        showButton
      >
        <Box flex pad="medium" height={{ max: '100%' }} overflow={'auto'}>
          <Markdown>{program?.conditions ?? ''}</Markdown>
        </Box>
      </Modal>
    </Panel>
  );
}
