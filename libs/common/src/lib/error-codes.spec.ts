import { errorCodeToMessage } from './error-codes';

describe('errorCodeToMessage (#290)', () => {
  it('známy kód vráti celú správu (nie jeden znak)', () => {
    expect(errorCodeToMessage('not_authorized')).toBe(
      'Nemáte oprávnenie na vykonanie tejto akcie.',
    );
    expect(errorCodeToMessage('team_already_registered')).toBe('Tím je už zaregistrovaný.');
  });

  it('neznámy kód vráti „Chyba <kód>.“', () => {
    expect(errorCodeToMessage('neznamy_kod')).toBe('Chyba neznamy_kod.');
    // vlastnosti prototypu nie sú správy
    expect(errorCodeToMessage('toString')).toBe('Chyba toString.');
  });

  it('pridá kontext do zátvorky', () => {
    expect(errorCodeToMessage('event_full', 'Turnaj BA')).toBe('Turnaj je naplnený. (Turnaj BA)');
    expect(errorCodeToMessage('x', null)).toBe('Chyba x.');
  });

  it('má správu pre každý kód pravidiel registrácie (#283)', () => {
    for (const code of [
      'event_not_found',
      'event_not_available',
      'registration_closed',
      'event_past',
      'not_invited',
      'event_full',
      'program_not_found',
      'program_not_active',
      'program_full',
      'registration_type_not_allowed',
    ]) {
      expect(errorCodeToMessage(code)).not.toMatch(/^Chyba /);
    }
  });
});
