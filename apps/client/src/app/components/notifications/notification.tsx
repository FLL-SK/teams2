import React from 'react';
import { Box, Text } from 'grommet';
import { NotificationVariant } from './notification-provider';

interface NotificationProps {
  message: string;
  details?: string;
  variant?: NotificationVariant;
}

export function Notification(props: NotificationProps) {
  const { message, details, variant = 'info' } = props;
  const color = variant === 'error' ? 'danger' : 'info';
  return (
    <Box pad="small" background={color} margin="medium">
      <Text>{message}</Text>
      {details && <Text>{details}</Text>}
    </Box>
  );
}
