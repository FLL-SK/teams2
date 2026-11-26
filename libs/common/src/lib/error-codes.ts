const errorMessages: Record<string, string> = {
  error: 'Vyskytla sa chyba',
  not_authorized: 'Nemáte oprávnenie na vykonanie tejto akcie.',
  wrong_input: 'Nesprávne vstupy.',

  // registrácie
  registration_failed: 'Registrácia sa nepodarila.',
  registration_not_found: 'Registrácia sa nenašla.',
  registration_failed_to_copy_items: 'Nepodarilo sa skopírovať fakturačné položky do registrácie.',
  registration_failed_to_send_email: 'Registrácia prebehla, ale nepodarilo sa odoslať e-mail.',
  team_already_registered: 'Tím je už zaregistrovaný.',
  team_not_found: 'Tím sa nenašiel.',
  cannot_cancel: 'Registráciu nie je možné zrušiť.',
  already_canceled: 'Registrácia už bola zrušená.',

  // pravidlá registrácie (#283)
  event_not_found: 'Turnaj sa nenašiel.',
  event_not_available: 'Turnaj je zrušený alebo archivovaný.',
  registration_closed: 'Termín registrácie na turnaj už uplynul.',
  event_past: 'Turnaj už prebehol.',
  not_invited: 'Na turnaj sa dá registrovať iba na pozvánku.',
  event_full: 'Turnaj je naplnený.',
  program_not_found: 'Program sa nenašiel.',
  program_not_active: 'Do programu sa momentálne nedá registrovať.',
  program_full: 'Program je naplnený.',
  registration_type_not_allowed: 'Tento typ registrácie program nepovoľuje.',

  // fakturácia a objednávky jedla
  registration_invoice_post_error: 'Faktúru sa nepodarilo vystaviť.',
  registration_invoice_email_error: 'Faktúru sa nepodarilo odoslať e-mailom.',
  food_order_not_found: 'Objednávka jedla sa nenašla.',
  food_item_not_found: 'Položka objednávky jedla sa nenašla.',
  food_invoice_not_found: 'Faktúra za jedlo sa nenašla.',
  food_invoice_post_error: 'Faktúru za jedlo sa nepodarilo vystaviť.',
  food_invoice_email_error: 'Faktúru za jedlo sa nepodarilo odoslať e-mailom.',
};

/** chybový kód (napr. z payloadu mutácie) → správa pre používateľa */
export function errorCodeToMessage(code: string, context?: string | null): string {
  const msg = Object.prototype.hasOwnProperty.call(errorMessages, code)
    ? errorMessages[code]
    : undefined;
  // predtým `msg[1]` – vrátilo iba druhý znak správy (#290)
  return (msg ?? `Chyba ${code}.`) + (context ? ` (${context})` : '');
}
