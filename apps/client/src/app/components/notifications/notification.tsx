import React from 'react';
import { Box, Button, Text } from 'grommet';
import { NotificationVariant } from './notification-provider';
import { Close } from 'grommet-icons';

interface NotificationProps {
  message: string;
  details?: string;
  variant?: NotificationVariant;
  onClose: () => void;
}

export function Notification(props: NotificationProps) {
  const { message, details, variant = 'info', onClose } = props;
  const color = variant === 'info' ? 'rgba(240, 230, 140, 0.9)' : 'rgba(255, 69, 0, 0.9)';
  return (
    <Box pad="small" background={{ color }} margin="medium">
      <Box direction="row" justify="between" width="100%">
        <Text>{message}</Text>
        <Button plain icon={<Close size="small" />} onClick={onClose} />
      </Box>
      {details && <Text>{details}</Text>}
    </Box>
  );
}
