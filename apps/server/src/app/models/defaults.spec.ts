import { fileRepository, teamRepository, userRepository } from './index';

describe('defaulty a indexy modelov (#285)', () => {
  it('createdOn sa nastaví na čas vytvorenia dokumentu, nie na čas štartu servera', async () => {
    // schéma sa vytvorila pri importe – pôvodný default (`new Date()`) by mal čas importu
    await new Promise((r) => setTimeout(r, 20));
    const before = Date.now();
    const u = new userRepository({ username: 'a@example.com', password: 'x' });
    const t = new teamRepository({ name: 'T' });
    const after = Date.now();
    for (const d of [u.createdOn, t.createdOn]) {
      expect(d.getTime()).toBeGreaterThanOrEqual(before);
      expect(d.getTime()).toBeLessThanOrEqual(after);
    }
  });

  it('index súborov je na poli type (nie ttype)', () => {
    const keys = fileRepository.schema.indexes().map(([fields]) => fields);
    expect(keys).toContainEqual({ type: 1, ref: 1 });
    expect(keys).not.toContainEqual({ ttype: 1, ref: 1 });
  });
});
