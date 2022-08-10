import React from 'react';
import { Text } from 'grommet';
import { FileTile } from '../../../components/file-tile';
import { useGetRegistrationFilesQuery } from '../../../generated/graphql';

interface RegistrationFilesPanelProps {
  registrationId: string;
  regConfirmed: boolean;
}

export function RegistrationFilesPanel(props: RegistrationFilesPanelProps) {
  const { registrationId, regConfirmed } = props;
  const { data } = useGetRegistrationFilesQuery({
    variables: { id: registrationId },
    pollInterval: 600000, // get updated urls before they expire});
  });

  const files = data?.getRegistrationFiles ?? [];

  return files.length === 0 ? (
    <Text>{`${
      regConfirmed
        ? 'Žiadne súbory.'
        : 'Vaša registrácia ešte nebola potvrdená. Súbory budú dostupné až po potvrdení vašej registrácie.'
    }`}</Text>
  ) : (
    <>
      {files.map((file) => (
        <FileTile key={file.id} file={file} readOnly />
      ))}
    </>
  );
}
