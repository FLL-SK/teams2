import React from 'react';
import { Box, Button, Text } from 'grommet';
import styled from 'styled-components';
import { NoteDetail } from './note-detail';
import { Note, useDeleteNoteMutation, useUpdateNoteMutation } from '../generated/graphql';
import { InPlaceMarkdown } from './editors/inplace-markdown';

const Wrapper = styled(Box)`
  margin: 5px 0;
`;

interface NoteListProps {
  notes?: Array<Omit<Note, 'creator'>>;
  onCreate?: (text: string) => void;
  onListChanged?: () => void;
  placeholder?: string;
  disabled?: boolean;
  limit?: number;
}

export function NoteList(props: NoteListProps) {
  const { notes, onCreate, onListChanged, placeholder, disabled, limit = 100 } = props;

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
        {(notes ?? [])
          .filter((v, idx) => idx < limit)
          .map((note) => (
            <NoteDetail
              key={note.id}
              note={note}
              onDelete={deleteNote}
              onUpdate={updateNote}
              disabled={disabled}
            />
          ))}
      </Box>
      {limit < (notes ?? []).length && (
        <Box>
          <Text size="small" color="dark-5">{`Zobrazovaných je ostatných ${limit} záznamov`}</Text>
        </Box>
      )}
    </Wrapper>
  );
}
