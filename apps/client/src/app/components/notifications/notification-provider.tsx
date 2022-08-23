import React, { createContext, ReactNode, useCallback, useContext, useReducer } from 'react';

const ALERT_DELAY = 5000;
const ALERT_DELAY_FATAL = 10000;

export type NotificationVariant = 'info' | 'error' | 'fatal';

export interface NotificationType {
  id: number;
  msg: string;
  details?: string;
  variant?: NotificationVariant;
}

export type NotificationMethod = (msg: string, details?: string) => void;
export interface NotifyInterface {
  error: NotificationMethod;
  fatal: NotificationMethod;
  info: NotificationMethod;
}

export type NotificationContextType = {
  notifications: NotificationType[];
  notify: NotifyInterface;
  remove: (id: number, details?: string) => void;
  clear: () => void;
};

export const NotificationContext = createContext<NotificationContextType>({
  notifications: [],
  notify: { error: () => null, fatal: () => null, info: () => null },
  remove: () => null,
  clear: () => null,
});

export const useNotification = (): NotificationContextType => useContext(NotificationContext);

interface NotificationAction {
  type: string;
  notification?: NotificationType;
  id?: number;
}

function dispatchNotification(
  state: NotificationType[],
  action: NotificationAction
): NotificationType[] {
  switch (action.type) {
    case 'ADD':
      if (action.notification) return [...state, action.notification];
      return state;

    case 'REMOVE': {
      const a = [...state];
      const i = a.findIndex((ac) => ac.id === action.id);
      if (i >= 0) a.splice(i, 1);
      return a;
    }
    case 'CLEAR':
      return [];
    default:
      console.error('DispatchNotification: Unknown action type', action.type);
  }
  return [];
}

export const NotificationProvider = (props: { children?: ReactNode }): JSX.Element => {
  const { children } = props;
  const [state, dispatch] = useReducer(dispatchNotification, []);

  const clearNotifications = useCallback(() => dispatch({ type: 'CLEAR' }), []);
  const removeNotification = useCallback((id: number) => dispatch({ type: 'REMOVE', id }), []);

  const notifyError = useCallback(
    (msg: string, details?: string) => {
      const delay = ALERT_DELAY;
      const id = Date.now() + delay;
      dispatch({
        type: 'ADD',
        notification: { id, msg, details, variant: 'error' },
      });
      setTimeout(() => removeNotification(id), delay);
    },
    [removeNotification]
  );

  const notifyFatal = useCallback(
    (msg: string, details?: string) => {
      const delay = ALERT_DELAY_FATAL;
      const id = Date.now() + delay;
      dispatch({
        type: 'ADD',
        notification: { id, msg, details, variant: 'fatal' },
      });
      setTimeout(() => removeNotification(id), delay);
    },
    [removeNotification]
  );

  const notifyInfo = useCallback(
    (msg: string, details?: string) => {
      const delay = ALERT_DELAY;
      const id = Date.now() + delay;
      dispatch({
        type: 'ADD',
        notification: { id, msg, details, variant: 'info' },
      });
      setTimeout(() => removeNotification(id), delay);
    },
    [removeNotification]
  );

  return (
    <NotificationContext.Provider
      value={{
        notifications: state,
        notify: { error: notifyError, fatal: notifyFatal, info: notifyInfo },
        remove: removeNotification,
        clear: clearNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};
