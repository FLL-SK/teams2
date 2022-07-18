import React from 'react';
import { Box } from 'grommet';
import styled from 'styled-components';
import { NoteDetail } from './note-detail';
import { Note, useDeleteNoteMutation, useUpdateNoteMutation } from '../generated/graphql';
import { InPlaceMarkdown } from './inplace-markdown';

const Wrapper = styled(Box)`
  margin: 5px 0;
`;

interface NoteListProps {
  notes?: Array<Omit<Note, 'creator'>>;
  onCreate?: (text: string) => void;
  onListChanged?: () => void;
  placeholder?: string;
  disabled?: boolean;
}

export function NoteList(props: NoteListProps) {
  const { notes, onCreate, onListChanged, placeholder, disabled } = props;

  const [updateNoteMutation] = useUpdateNoteMutation();
  const [deleteNoteMutation] = useDeleteNoteMutation();

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
        <Box background={'light-1'}>
          <InPlaceMarkdown
            value=""
            onSubmit={(value) => value && onCreate(value)}
            placeholder={placeholder ? placeholder : 'Pridaj poznámku'}
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
            disabled={disabled}
          />
        ))}
      </Box>
    </Wrapper>
  );
}
