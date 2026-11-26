import { NotificationMethod } from '../components/notifications/notification-provider';
import { MutationError } from '../_generated/graphql';
import { errorCodeToMessage } from '@teams2/common';

export type MutationData = { errors?: MutationError[] | null } | undefined | null;

/**
 * Zobrazí chyby z payloadu mutácie (`errors[]`, konvencia #298) a vráti `true`, ak nejaké boli.
 * GraphQL chyby (napr. FORBIDDEN) rieši `onError` mutácie.
 */
export const handleMutationErrors = (
  data: MutationData,
  message: string,
  notify: NotificationMethod,
): boolean => {
  // prázdne pole `errors` nie je chyba
  if (data?.errors?.length) {
    data.errors.forEach((e) => notify(message, errorCodeToMessage(e.code)));
    return true;
  }
  return false;
};
