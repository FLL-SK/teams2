import React, { useState } from 'react';
import { Box, Button, Markdown, TextArea } from 'grommet';
import styled from 'styled-components';
import { Note } from '../generated/graphql';
import { useAppUser } from './app-user/use-app-user';
import { Avatar } from './avatar';
import { formatDate, toZonedDateTime } from '@teams2/dateutils';
import { getColor } from '../theme';

const NoteWrapper = styled(Box)`
  margin: 5px 0;
`;

const NoteTextWrapper = styled(Box)`
  display: block;
  background-color: ${getColor('light-3')};
`;

const Header = styled(Box)`
  font-size: 14px;
  color: ${getColor('dark-5')};
`;

interface NoteDetailProps {
  note: Note;
  onUpdate?: (note: Note) => void;
  onDelete?: (note: Note) => void;
  disabled?: boolean;
}

export function NoteDetail(props: NoteDetailProps) {
  const { note, onUpdate, onDelete, disabled } = props;
  const { isAdmin, user } = useAppUser();

  const isNoteCreator = note.createdBy === user?.id;
  const [editing, setEditing] = useState(false);
  const [mdText, setMdText] = useState<string | undefined>(note.text);

  return (
    <NoteWrapper direction="row">
      <Box width={{ min: '60px' }}>
        <Avatar user={note.creator} />
      </Box>
      {!editing && (
        <Box direction="column">
          <Header>
            {note.createdOn &&
              `${formatDate(toZonedDateTime(note.createdOn))} ${note.creator?.name}`}
            {note.updatedOn ? `(zmenená)` : null}
          </Header>
          <NoteTextWrapper>
            <Markdown>{note.text}</Markdown>
          </NoteTextWrapper>
          {!disabled && (
            <Box direction="row" color="brand" gap="20px">
              {isNoteCreator && (
                <Button plain size="small" onClick={() => setEditing(true)} label="Upraviť" />
              )}
              {(isNoteCreator || isAdmin) && (
                <Button
                  plain
                  size="small"
                  onClick={() => onDelete && onDelete(note)}
                  label="Odstrániť"
                />
              )}
            </Box>
          )}
        </Box>
      )}
      {editing && (
        <Box>
          <TextArea value={mdText} onChange={({ target }) => setMdText(target.value)} />
          <Box margin="small" alignSelf="end" direction="row" gap="small">
            <Button
              size="small"
              label="Zrušiť"
              onClick={() => {
                setEditing(false);
                setMdText(note.text);
              }}
            />
            <Button
              size="small"
              primary
              label="Potvrdiť"
              onClick={() => {
                onUpdate && onUpdate({ ...note, text: mdText || '' });
                setEditing(false);
                setMdText('');
              }}
            />
          </Box>
        </Box>
      )}
    </NoteWrapper>
  );
}
