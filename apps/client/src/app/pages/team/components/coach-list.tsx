import { appPath } from '@teams2/common';
import { Anchor, Box, Button, Text } from 'grommet';
import { Close } from 'grommet-icons';
import React from 'react';
import { UserBasicFragmentFragment } from '../../../_generated/graphql';
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
        <Box
          direction="row"
          wrap
          width="100%"
          align="center"
          key={m.id}
          hoverIndicator
          border={{ side: 'bottom', color: 'light-5' }}
        >
          <Box width="90%" direction="row" wrap gap="medium" align="center">
            <Box width={{ min: '350px' }}>
              <Anchor href={appPath.profile(m.id)}>
                {formatFullName(m.firstName, m.lastName)}
              </Anchor>
            </Box>
            <Box width={{ min: '350px' }} direction="row" gap="medium" wrap>
              <Text size="small">{m.username}</Text>
              <Text size="small">{m.phone}</Text>
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
