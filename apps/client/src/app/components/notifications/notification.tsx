import React from 'react';
import { Box, Button, Text } from 'grommet';
import { NotificationVariant } from './notification-provider';
import { getColor } from '../../theme';
import { Close } from 'grommet-icons';

interface NotificationProps {
  message: string;
  details?: string;
  variant?: NotificationVariant;
  onClose: () => void;
}

export function Notification(props: NotificationProps) {
  const { message, details, variant = 'info', onClose } = props;
  const color = variant === 'info' ? 'light-2' : 'status-error';
  return (
    <Box pad="small" background={{ color: getColor(color) }} margin="medium" flex>
      <Box direction="row" justify="between">
        <Text>{message}</Text>
        <Button plain icon={<Close size="small" />} onClick={onClose} />
      </Box>
      {details && <Text>{details}</Text>}
    </Box>
  );
}
