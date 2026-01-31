import React from 'react';
import { Box, Text } from 'grommet';
import styled from 'styled-components';
import { NoteDetail } from './note-detail';
import {
  Note,
  DeleteNoteDocument,
  DeleteNoteMutation,
  DeleteNoteMutationVariables,
  UpdateNoteDocument,
  UpdateNoteMutation,
  UpdateNoteMutationVariables,
  NoteFragmentFragment,
} from '../_generated/graphql';
import { useMutation } from '@apollo/client/react';
import { InPlaceMarkdown } from './editors/inplace-markdown';

const Wrapper = styled(Box)`
  margin: 5px 0;
`;

interface NoteListProps {
  notes?: Array<Omit<NoteFragmentFragment, 'creator'>>;
  onCreate?: (text: string) => void;
  onListChanged?: () => void;
  placeholder?: string;
  disabled?: boolean;
  limit?: number;
}

export function NoteList(props: NoteListProps) {
  const { notes, onCreate, onListChanged, placeholder, disabled, limit = 100 } = props;

  const [updateNoteMutation] = useMutation<UpdateNoteMutation, UpdateNoteMutationVariables>(
    UpdateNoteDocument,
  );
  const [deleteNoteMutation] = useMutation<DeleteNoteMutation, DeleteNoteMutationVariables>(
    DeleteNoteDocument,
  );

  const updateNote = async (note: Note) => {
    const { id, text } = note;
    const response = await updateNoteMutation({ variables: { id, input: { text } } });
  };

  const deleteNote = async (note: Note) => {
    const { id } = note;
    await deleteNoteMutation({ variables: { id } });
    onListChanged && onListChanged();
  };

  return (
    <Wrapper>
      {!disabled && onCreate && (
        <Box background={'light-3'}>
          <InPlaceMarkdown
            key={Date.now()}
            value={undefined}
            onSubmit={(value) => value && onCreate(value)}
            placeholder={placeholder ? placeholder : 'kliknutím pridať poznámku...'}
            disabled={disabled}
          />
        </Box>
      )}
      <Box>
        {notes ? (
          notes
            .filter((v, idx) => idx < limit)
            .map((note) => (
              <NoteDetail
                key={note.id}
                note={note}
                onDelete={deleteNote}
                onUpdate={updateNote}
                disabled={disabled}
              />
            ))
        ) : (
          <Text size="small" color="status-error">{`Nepodarilo sa načítať poznámky.`}</Text>
        )}
      </Box>
      {limit < (notes ?? []).length && (
        <Box>
          <Text size="small" color="dark-5">{`Zobrazovaných je ostatných ${limit} záznamov`}</Text>
        </Box>
      )}
    </Wrapper>
  );
}
