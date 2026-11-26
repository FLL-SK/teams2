import { FORBIDDEN_MESSAGE, localizeForbiddenErrors } from './forbidden-errors';

describe('localizeForbiddenErrors (#298)', () => {
  it('chybu s kódom FORBIDDEN nahradí slovenskou hláškou a pôvodnú správu ponechá', () => {
    const result = localizeForbiddenErrors({
      data: null,
      errors: [
        { message: '(coach) Not authorized: Update team', extensions: { code: 'FORBIDDEN' } },
        { message: 'Iná chyba', extensions: { code: 'INTERNAL_SERVER_ERROR' } },
      ],
    });
    expect(result.errors?.[0]).toEqual({
      message: 'Nemáte oprávnenie na vykonanie tejto akcie.',
      extensions: { code: 'FORBIDDEN', serverMessage: '(coach) Not authorized: Update team' },
    });
    expect(result.errors?.[0].message).toBe(FORBIDDEN_MESSAGE);
    expect(result.errors?.[1].message).toBe('Iná chyba');
  });

  it('výsledok bez FORBIDDEN vráti nezmenený', () => {
    const ok = { data: { x: 1 } };
    expect(localizeForbiddenErrors(ok)).toBe(ok);
    const other = { errors: [{ message: 'boom' }] };
    expect(localizeForbiddenErrors(other)).toBe(other);
  });
});
