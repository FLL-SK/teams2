import { handleMutationErrors } from './handle_mutation_error';

describe('handleMutationErrors (#298)', () => {
  it('zobrazí každú chybu ako správu pre používateľa a vráti true', () => {
    const notify = vi.fn();
    const r = handleMutationErrors(
      { errors: [{ code: 'team_already_registered' }, { code: 'neznamy' }] },
      'Nepodarilo sa registrovať tím.',
      notify,
    );
    expect(r).toBe(true);
    expect(notify).toHaveBeenNthCalledWith(
      1,
      'Nepodarilo sa registrovať tím.',
      'Tím je už zaregistrovaný.',
    );
    expect(notify).toHaveBeenNthCalledWith(2, 'Nepodarilo sa registrovať tím.', 'Chyba neznamy.');
  });

  it('bez chýb (null, undefined, prázdne pole) vráti false a nič nezobrazí', () => {
    const notify = vi.fn();
    expect(handleMutationErrors(undefined, 'x', notify)).toBe(false);
    expect(handleMutationErrors(null, 'x', notify)).toBe(false);
    expect(handleMutationErrors({ errors: null }, 'x', notify)).toBe(false);
    expect(handleMutationErrors({ errors: [] }, 'x', notify)).toBe(false);
    expect(notify).not.toHaveBeenCalled();
  });
});
