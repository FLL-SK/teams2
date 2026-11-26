import type { FormattedExecutionResult } from 'graphql';
import { errorCodeToMessage, FORBIDDEN_ERROR_CODE } from '@teams2/common';

/** hláška pre používateľa pri zamietnutom prístupe (GraphQL chyba s kódom FORBIDDEN) */
export const FORBIDDEN_MESSAGE = errorCodeToMessage('not_authorized');

/**
 * Nahradí technickú správu servera (`(user) Not authorized: Update team`) pri chybách s kódom
 * FORBIDDEN slovenskou hláškou. Pôvodná správa zostane v `extensions.serverMessage` (#298).
 */
export function localizeForbiddenErrors<T extends FormattedExecutionResult>(result: T): T {
  if (!result.errors?.some((e) => e.extensions?.code === FORBIDDEN_ERROR_CODE)) {
    return result;
  }
  return {
    ...result,
    errors: result.errors.map((e) =>
      e.extensions?.code === FORBIDDEN_ERROR_CODE
        ? {
            ...e,
            message: FORBIDDEN_MESSAGE,
            extensions: { ...e.extensions, serverMessage: e.message },
          }
        : e,
    ),
  };
}
