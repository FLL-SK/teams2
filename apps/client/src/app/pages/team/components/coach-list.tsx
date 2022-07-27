import { Box, Button, Text } from 'grommet';
import { Close } from 'grommet-icons';
import React from 'react';
import { ListRow2 } from '../../../components/list-row';
import { UserBasicFragmentFragment } from '../../../generated/graphql';
import { formatFullName } from '../../../utils/format-fullname';

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
        <Box direction="row" wrap width="100%" align="center" key={m.id} hoverIndicator>
          <Box width="90%" direction="row" wrap gap="medium" align="center">
            <Box width={{ min: '350px' }}>
              <Text>{formatFullName(m.firstName, m.lastName)}</Text>
            </Box>
            <Box width={{ min: '350px' }}>
              <Text size="small">
                {m.username}, {m.phone}
              </Text>
            </Box>
          </Box>
          <Box pad="small">
            {onRemove && (
              <Button
                plain
                icon={<Close size="small" />}
                onClick={() => onRemove(m.id)}
                disabled={!canEdit}
              />
            )}
          </Box>
        </Box>
      ))}
    </Box>
  );
}
