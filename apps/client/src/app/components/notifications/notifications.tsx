import React from 'react';
import styled from 'styled-components';
import { useNotification } from './notification-provider';
import { Notification } from './notification';

const Container = styled.div`
  position: relative;
  min-width: 300px;
  width: 400px;
  margin: 0 auto;
`;

const Canvas = styled.div`
  position: fixed;
  top: 0px;
  left: 0px;
  z-index: 100;
  min-width: 100%px;
  width: 100%;
`;

export function Notifications() {
  const { notifications, remove } = useNotification();

  return (
    <Canvas id="notification-canvas">
      <Container id="notifications">
        {notifications.map((a) => (
          <Notification
            key={a.id}
            message={a.msg}
            details={a.details}
            variant={a.variant}
            onClose={() => remove(a.id)}
          />
        ))}
      </Container>
    </Canvas>
  );
}
