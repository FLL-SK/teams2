import { NotificationMethod } from '../components/notifications/notification-provider';
import { MutationError } from '../_generated/graphql';
import { errorCodeToMessage } from '@teams2/common';

type MutationData = { errors?: MutationError[] | null } | undefined | null;

export const handleMutationErrors = (
  data: MutationData,
  message: string,
  notify: NotificationMethod,
): boolean => {
  if (data && data.errors) {
    data.errors.forEach((e) => notify(message, errorCodeToMessage(e.code)));
    return true;
  }
  return false;
};
