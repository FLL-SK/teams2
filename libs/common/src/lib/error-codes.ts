const errorMessages = {
  error: 'Vyskytla sa chyba',
  not_authorized: 'Nemáte oprávnenie na vykonanie tejto akcie.',
  wrong_input: 'Nesprávne vstupy.',
};

// Error code to message
export function errorCodeToMessage(code: string, context?: string | null): string {
  const msg = errorMessages[code];
  return (msg ? msg[1] : `Chyba ${code}.`) + (context ? ` (${context})` : '');
}
