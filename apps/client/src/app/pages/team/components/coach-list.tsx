import { Box, Button, Text } from 'grommet';
import { Close } from 'grommet-icons';
import React from 'react';
import { ListRow2 } from '../../../components/list-row';
import { UserBasicFragmentFragment } from '../../../generated/graphql';

interface CoachListProps {
  coaches: UserBasicFragmentFragment[];
  onRemove?: (id: string) => Promise<unknown>;
  canEdit?: boolean;
}

export function CoachList(props: CoachListProps) {
  const { coaches, onRemove, canEdit } = props;

  return (
    <Box gap="small">
      {coaches.map((m) => (
        <ListRow2 columns="1fr 1fr 1fr 1fr auto" key={m.id} align="center">
          <Text>{m.username}</Text>
          <Text>{m.firstName}</Text>
          <Text>{m.lastName}</Text>
          <Text>{m.phone}</Text>
          <Box justify="end">
            {onRemove && (
              <Button
                plain
                icon={<Close size="small" />}
                onClick={() => onRemove(m.id)}
                disabled={!canEdit}
              />
            )}
          </Box>
        </ListRow2>
      ))}
    </Box>
  );
}
