import React from 'react';
import styled from 'styled-components';
import { useNotification } from './notification-provider';
import { Notification } from './notification';

const Container = styled.div`
  position: fixed;
  top: 10px;
  left: 10px;
  z-index: 100;
  min-width: 300px;
  width: 300px;
`;

export function Notifications() {
  const { notifications } = useNotification();

  return (
    <Container id="notifications">
      {notifications.map((a) => (
        <Notification key={a.id} message={a.msg} details={a.details} variant={a.variant} />
      ))}
    </Container>
  );
}
