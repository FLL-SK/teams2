import React, { useState } from 'react';
import { Box } from 'grommet';
import styled from 'styled-components';
import { getColor } from '../../theme/colors';
import { Avatar } from '../avatar';
import { getInputBackgroundColor, InputBackgroundColor } from '../../theme/theme';
import { Button } from '../button';
import { useAccountMember } from '../../hooks/use-account-member';\
import { Note } from '../generated/graphql';

const NoteWrapper = styled(Box)`
  margin: 5px 0;
`;

const NoteTextWrapper = styled(Box)<{ bkg?: InputBackgroundColor }>`
  display: block;
  background-color: ${(props) => getInputBackgroundColor(props.bkg)};
`;

const Header = styled(Box)`
  font-size: 14px;
  color: ${getColor('dark-5')};
`;

interface NoteDetailProps {
  note: Note;
  onUpdate?: (note: Note) => void;
  onDelete?: (note: Note) => void;
  background?: InputBackgroundColor;
  disabled?: boolean;
}

export function NoteDetail(props: NoteDetailProps) {
  const { note, onUpdate, onDelete, background, disabled } = props;
  const { accountMember } = useAccountMember();
  const accountMemberId = accountMember?.id ?? '0';
  const isAdmin = (accountMember?.roles ?? []).indexOf('ADMIN') >= 0;
  const isOwner = note.createdBy && note.createdBy === accountMemberId;
  const [editing, setEditing] = useState(false);
  const [mdText, setMdText] = useState<string | undefined>(note.text);

  return (
    <NoteWrapper direction="row">
      <Box width={{ min: '60px' }}>
        <Avatar user={note.creator as UserFragmentFragment} />
      </Box>
      {!editing && (
        <Box direction="column">
          <Header>
            {note.createdOn && toLocaleDateTimeString(toZonedDateTime(note.createdOn, timeZone), locale)} -{' '}
            {note.creator?.fullName}
            {note.updatedOn ? `(${t('note.edited')})` : null}
          </Header>
          <NoteTextWrapper bkg={background}>
            <MDEditor.Markdown source={note.text} />
          </NoteTextWrapper>
          {!disabled && (
            <Box direction="row" color="brand" gap="20px">
              {isOwner && (
                <Button plain size="small" onClick={() => setEditing(true)} label="Upraviť"/>
              )}
              {(isOwner || isAdmin) && (
                <Button plain size="small" onClick={() => onDelete && onDelete(note)} label="Odstrániť"/>
              )}
            </Box>
          )}
        </Box>
      )}
      {editing && (
        <Box>
          <MDEditor value={mdText} onChange={(value) => setMdText(value)} preview={'edit'} />

          <Box margin="small" alignSelf="end" direction="row" gap="small">
            <Button
              size="small"
              labelKey="actions.cancel"
              onClick={() => {
                setEditing(false);
                setMdText(note.text);
              }}
            />
            <Button
              size="small"
              primary
              labelKey="actions.submit"
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
