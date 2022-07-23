import { Box, Button, FileInput } from 'grommet';
import React, { useState } from 'react';
import { ListRow2 } from './list-row';

interface FileUploadControlProps {
  disabled?: boolean;
  onUpload?: (files: FileList) => unknown;
}

const messages = {
  browse: 'vyhľadať',
  dropPrompt: 'Priložte sem súbor alebo ho môžete',
  dropPromptMultiple: 'Priložte sem súbory alebo ich môžete',
  files: 'súbory',
  remove: 'odstrániť',
  removeAll: 'odstrániť všetky',
  maxFile: 'Attach a maximum of {max} files only.',
};

export function FileUploadControl(props: FileUploadControlProps) {
  const { disabled, onUpload } = props;
  const [toUpload, setToUpload] = useState<FileList>();

  return (
    <ListRow2 columns="1fr 10px auto" align="center">
      <FileInput
        name="file"
        messages={messages}
        disabled={disabled}
        onChange={(event) => {
          const fileList = event?.target.files;
          if (fileList) {
            setToUpload(fileList);
          }
        }}
      />
      <div />
      <Box>
        <Button
          label="Nahrať"
          disabled={!toUpload}
          onClick={() => {
            !!toUpload && onUpload && onUpload(toUpload);
            setToUpload(undefined);
          }}
        />
      </Box>
    </ListRow2>
  );
}
