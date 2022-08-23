import { NotificationMethod } from '../components/notifications/notification-provider';
import { MutationError } from '../generated/graphql';
import { errorCodeToMessage } from '@teams2/common';

type MutationData = { error?: MutationError | null } | undefined | null;

export const handleMutationErrors = (
  data: MutationData,
  message: string,
  notify: NotificationMethod
): boolean => {
  if (data && data.error) {
    notify(message, errorCodeToMessage(data.error.code, data.error.message));
    return true;
  }
  return false;
};
