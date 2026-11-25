import { compare } from 'bcryptjs';
import { hashPasswordOnSave, hashPasswordOnUpdate, userRepository } from './user.model';

// Regresia #281: hook pre('save') hashoval heslo pri každom save() (aj bez zmeny hesla)
// a findByIdAndUpdate ukladal heslo ako čistý text.

describe('hashovanie hesla v modeli používateľa (#281)', () => {
  const newUser = () =>
    new userRepository({
      username: 'a@example.com',
      password: 'tajneheslo',
      firstName: 'A',
      lastName: 'B',
      createdOn: new Date(),
    });

  it('nový používateľ – heslo sa zahashuje, passwordChangedOn sa nenastaví', async () => {
    const u = newUser();
    await hashPasswordOnSave.call(u);
    expect(u.password).not.toBe('tajneheslo');
    await expect(compare('tajneheslo', u.password)).resolves.toBe(true);
    expect(u.passwordChangedOn).toBeUndefined();
  });

  it('save() bez zmeny hesla heslo neprehashuje', async () => {
    const u = newUser();
    await hashPasswordOnSave.call(u);
    const hash = u.password;
    // simulácia načítaného dokumentu: nie je nový a heslo nie je zmenené
    u.isNew = false;
    vi.spyOn(u, 'isModified').mockReturnValue(false);
    u.firstName = 'Iné';
    await hashPasswordOnSave.call(u);
    expect(u.password).toBe(hash);
    await expect(compare('tajneheslo', u.password)).resolves.toBe(true);
  });

  it('zmena hesla existujúceho používateľa – nový hash a passwordChangedOn', async () => {
    const u = newUser();
    u.isNew = false;
    u.password = 'noveheslo1';
    vi.spyOn(u, 'isModified').mockImplementation((p?: string | string[]) => p === 'password');
    await hashPasswordOnSave.call(u);
    await expect(compare('noveheslo1', u.password)).resolves.toBe(true);
    expect(u.passwordChangedOn).toBeInstanceOf(Date);
  });

  it('findOneAndUpdate s heslom – heslo sa zahashuje (priamo aj v $set)', async () => {
    for (const update of [{ password: 'noveheslo1' }, { $set: { password: 'noveheslo1' } }]) {
      const q = userRepository.findOneAndUpdate({}, update);
      await hashPasswordOnUpdate.call(q);
      const u = q.getUpdate() as { password?: string; $set?: { password?: string } };
      const stored = u.$set?.password ?? u.password;
      expect(stored).not.toBe('noveheslo1');
      await expect(compare('noveheslo1', stored ?? '')).resolves.toBe(true);
    }
  });

  it('findOneAndUpdate bez hesla update nemení', async () => {
    const q = userRepository.findOneAndUpdate({}, { lastLoginOn: new Date(0) });
    await hashPasswordOnUpdate.call(q);
    expect(q.getUpdate()).not.toHaveProperty('password');
    expect(q.getUpdate()).not.toHaveProperty('passwordChangedOn');
  });

  it('findActiveByUsername odmietne iný vstup ako reťazec (operátor MongoDB)', async () => {
    await expect(
      userRepository.findActiveByUsername({ $ne: null } as unknown as string),
    ).resolves.toBeNull();
    await expect(userRepository.findActiveByUsername('')).resolves.toBeNull();
  });
});
