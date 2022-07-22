import React, { useState } from 'react';
import { Box, Button, Markdown, TextArea, Text, Anchor } from 'grommet';
import styled from 'styled-components';
import { Note } from '../generated/graphql';
import { useAppUser } from './app-user/use-app-user';
import { formatDate, toZonedDateTime } from '@teams2/dateutils';
import { Edit, Trash } from 'grommet-icons';

const NoteWrapper = styled(Box)`
  margin: 5px 0;
`;

const NoteTextWrapper = styled(Box)<{ disabled?: boolean }>`
  display: block;
  position: relative;
  cursor: ${({ disabled }) => (disabled ? 'auto' : 'pointer')};
  .note-actions {
    visibility: hidden;
  }
  &:hover,
  &:focus {
    .note-actions {
      visibility: ${({ disabled }) => (disabled ? 'hidden' : 'visible')};
    }
  }
`;

interface NoteHeaderProps {
  createdOn: Date;
  updatedOn?: Date;
  username: string;
  name: string;
}

const NoteHeader = (props: NoteHeaderProps) => {
  const { createdOn, updatedOn, username } = props;
  return (
    <Box direction="row" align="center" gap="small" justify="between">
      {/* <Avatar name={name} username={username} size="small" /> */}
      <Box direction="row" align="center" gap="small">
        <Text size="small" color="dark-5">
          {formatDate(createdOn)}
          {updatedOn ? ` (zmenená)` : null}
        </Text>

        <Text size="small" color="dark-5">
          {username}
        </Text>
      </Box>
    </Box>
  );
};

interface NoteActionsProps {
  canEdit: boolean;
  onEdit: () => void;
  onDelete: () => void;
}

const NoteActions = (props: NoteActionsProps) => {
  const { canEdit, onEdit, onDelete } = props;
  return (
    <Box
      className="note-actions"
      direction="row"
      align="center"
      style={{ position: 'absolute', zIndex: 100, top: 0 }}
      justify="end"
      width="100%"
      background={{ color: 'light-2', opacity: 'strong' }}
    >
      {canEdit && <Button onClick={() => onEdit()} icon={<Edit color="brand" />} color="white" />}
      {canEdit && <Button onClick={() => onDelete && onDelete()} icon={<Trash color="brand" />} />}
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
          <NoteTextWrapper background="light-3">
            <Markdown>{note.text}</Markdown>
            <NoteActions
              canEdit={isNoteCreator || isAdmin()}
              onEdit={() => setEditing(true)}
              onDelete={() => onDelete && onDelete(note)}
            />
          </NoteTextWrapper>
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
