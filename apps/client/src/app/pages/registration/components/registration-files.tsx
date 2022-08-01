import React from 'react';
import { Box, Text } from 'grommet';
import { FileTile } from '../../../components/file-tile';
import { useGetRegistrationFilesQuery } from '../../../generated/graphql';

interface RegistrationFilesPanelProps {
  registrationId: string;
}

export function RegistrationFilesPanel(props: RegistrationFilesPanelProps) {
  const { registrationId } = props;
  const { data } = useGetRegistrationFilesQuery({
    variables: { id: registrationId },
    pollInterval: 600000, // get updated urls before they expire});
  });

  const files = data?.getRegistrationFiles ?? [];

  return files.length === 0 ? (
    <Text>Žiadne súbory, alebo ich nevidíte, lebo vaša registrácia ešte nebola potvrdená.</Text>
  ) : (
    <>
      {files.map((file) => (
        <FileTile key={file.id} file={file} readOnly />
      ))}
    </>
  );
}
