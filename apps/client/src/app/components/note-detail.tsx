import React, { useState } from 'react';
import { Box, Button, Markdown, TextArea, Text, Anchor } from 'grommet';
import styled from 'styled-components';
import { Note } from '../generated/graphql';
import { useAppUser } from './app-user/use-app-user';
import { formatDate, toZonedDateTime } from '@teams2/dateutils';

const NoteWrapper = styled(Box)`
  margin: 5px 0;
`;

const NoteTextWrapper = styled(Box)`
  display: block;
`;

const NoteHeader = ({
  createdOn,
  updatedOn,
  username,
  name,
}: {
  createdOn: Date;
  updatedOn?: Date;
  username: string;
  name: string;
}) => {
  return (
    <Box direction="row" align="center" gap="small">
      {/* <Avatar name={name} username={username} size="small" /> */}
      <Text size="small" color="dark-5">
        {formatDate(createdOn)}
        {updatedOn ? ` (zmenená)` : null}
      </Text>

      <Text size="small" color="dark-5">
        {username}
      </Text>
    </Box>
  );
};

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
    <NoteWrapper direction="column" width="100%">
      <NoteHeader
        createdOn={toZonedDateTime(note.createdOn)}
        updatedOn={note.updatedOn ? toZonedDateTime(note.updatedOn) : undefined}
        name={note.creator?.name ?? ''}
        username={note.creator?.username ?? ''}
      />

      <Box width="100%" gap="xsmall">
        {!editing && (
          <>
            <NoteTextWrapper background="light-3">
              <Markdown>{note.text}</Markdown>
            </NoteTextWrapper>
            {!disabled && (
              <Box direction="row" gap="small" justify="end">
                {isNoteCreator && (
                  <Anchor
                    size="small"
                    onClick={() => setEditing(true)}
                    label="Upraviť"
                    color="brand"
                  />
                )}
                {(isNoteCreator || isAdmin) && (
                  <Anchor
                    size="small"
                    onClick={() => onDelete && onDelete(note)}
                    label="Odstrániť"
                    color="brand"
                  />
                )}
              </Box>
            )}
          </>
        )}
        {editing && (
          <>
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
          </>
        )}
      </Box>
    </NoteWrapper>
  );
}
