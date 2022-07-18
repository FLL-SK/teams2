import React from 'react';
import { Box } from 'grommet';
import styled from 'styled-components';
import { NoteDetail } from './note-detail';

const Wrapper = styled(Box)`
  margin: 5px 0;
`;

interface NoteListProps {
  notes?: Array<Omit<INote, 'creator'>>;
  preview?: PreviewType;
  onCreate?: (text: string) => void;
  onListChanged?: () => void;
  placeholder?: string;
  disabled?: boolean;
}

export function NoteList(props: NoteListProps) {
  const { notes, onCreate, onListChanged, preview, placeholder, disabled } = props;

  const { saveHandler } = useSaveHandler();
  const [updateNoteMutation] = useUpdateNoteMutation();
  const [deleteNoteMutation] = useDeleteNoteMutation();
  const { t } = useTranslation();

  const updateNote = async (note: INote) => {
    await saveHandler({
      saveFn: async () => {
        const { id, text } = note;
        const response = await updateNoteMutation({ variables: { input: { id, text } } });
        return response.data?.updateNote;
      },
      onSuccess: () => {
        onListChanged && onListChanged();
      },
    });
  };

  const deleteNote = async (note: INote) => {
    await saveHandler({
      saveFn: async () => {
        const { id } = note;
        await deleteNoteMutation({ variables: { input: { id } } });
        return {};
      },
      onSuccess: () => {
        onListChanged && onListChanged();
      },
    });
  };

  return (
    <Wrapper>
      {!disabled && onCreate && (
        <Box background={'light-1'}>
          <InPlaceMarkdown
            value=""
            onSubmit={(value) => value && onCreate(value)}
            preview={preview}
            placeholder={placeholder ? placeholder : t('components.NoteList.addNotePlaceholder')}
            clickable={true}
            disabled={disabled}
          />
        </Box>
      )}
      <Box direction="column">
        {notes?.map((note) => (
          <NoteDetail
            key={note.id}
            note={note}
            onDelete={deleteNote}
            onUpdate={updateNote}
            background="light"
            disabled={disabled}
          />
        ))}
      </Box>
    </Wrapper>
  );
}
