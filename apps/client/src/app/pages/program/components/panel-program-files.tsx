import { Spinner, Text } from 'grommet';
import React, { useCallback } from 'react';
import { FileTile } from '../../../components/file-tile';
import { FileUploadControl } from '../../../components/file-upload-control';
import { useNotification } from '../../../components/notifications/notification-provider';
import { Panel } from '../../../components/panel';
import {
  FileUploadInput,
  ProgramFragmentFragment,
  useAddProgramFileMutation,
  useGetProgramFilesQuery,
  useGetProgramFileUploadUrlLazyQuery,
  useRemoveFileMutation,
} from '../../../generated/graphql';
import { uploadS3XHR } from '../../../utils/upload-s3-xhr';

interface PanelProgramFilesProps {
  program?: ProgramFragmentFragment;
  canEdit: boolean;
}

export function PanelProgramFiles(props: PanelProgramFilesProps) {
  const { program, canEdit } = props;
  const { notify } = useNotification();

  const [getUploadUrl] = useGetProgramFileUploadUrlLazyQuery({
    onError: (e) => notify.error('Nepodarilo sa získať adresu pre uloženie súbora.', e.message),
  });
  const [addProgramFile] = useAddProgramFileMutation({
    onCompleted: () => filesRefetch(),
    onError: (e) => notify.error('Nepodarilo sa uložiť súbor.', e.message),
  });
  const [removeFile] = useRemoveFileMutation({
    onCompleted: () => filesRefetch(),
    onError: (e) => notify.error('Nepodarilo sa zmazať súbor.', e.message),
  });

  const {
    data: filesData,
    loading: filesLoading,
    refetch: filesRefetch,
  } = useGetProgramFilesQuery({
    variables: { programId: program?.id ?? '0' },
    pollInterval: 600000, // get updated urls before they expire
  });

  const handleFileUpload = useCallback(
    async (files: FileList) => {
      for (let i = 0; i < files.length; i++) {
        const f = files[i];
        const ff: FileUploadInput = { name: f.name, size: f.size, contentType: f.type };
        getUploadUrl({
          variables: { programId: program?.id ?? '0', input: ff },
          onCompleted: async (data) => {
            if (await uploadS3XHR(f, data.getProgramFileUploadUrl)) {
              addProgramFile({ variables: { programId: program?.id ?? '0', input: ff } });
            }

            //TODO status/result notification
          },
        });
      }
    },
    [addProgramFile, getUploadUrl, program?.id]
  );

  const files = filesData?.getProgramFiles ?? [];

  if (!program) {
    return null;
  }

  return (
    <Panel title="Súbory" gap="small">
      {filesLoading ? (
        <Spinner />
      ) : files.length > 0 ? (
        files.map((f) => (
          <FileTile
            key={f.id}
            file={f}
            readOnly={!canEdit}
            onDelete={(f) => removeFile({ variables: { fileId: f.id } })}
          />
        ))
      ) : (
        <Text>Pre program nie sú dostupné žiadne súbory.</Text>
      )}
      {canEdit && <FileUploadControl onUpload={handleFileUpload} />}
    </Panel>
  );
}
