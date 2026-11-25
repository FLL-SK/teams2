import { preSeedAdmin } from './index';

const { findOne, create, updateOne } = vi.hoisted(() => ({
  findOne: vi.fn(),
  create: vi.fn(),
  updateOne: vi.fn(() => ({ exec: async () => ({}) })),
}));

vi.mock('../../models', async (importOriginal) => {
  const original = await importOriginal<typeof import('../../models')>();
  return { ...original, userRepository: { findOne, create, updateOne } };
});

describe('preSeedAdmin (#281)', () => {
  const env = { ...process.env };
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.SUPERADMIN_USERNAME = 'sa@example.com';
  });
  afterEach(() => {
    process.env = { ...env };
  });

  it('existujúci superadmin – heslo sa nemení (žiadne save())', async () => {
    const save = vi.fn();
    findOne.mockReturnValue({ exec: async () => ({ _id: 1, isAdmin: true, isSuperAdmin: true, save }) });
    await preSeedAdmin();
    expect(save).not.toHaveBeenCalled();
    expect(updateOne).not.toHaveBeenCalled();
  });

  it('existujúci používateľ bez príznakov – nastavia sa iba príznaky', async () => {
    const save = vi.fn();
    findOne.mockReturnValue({ exec: async () => ({ _id: 1, isAdmin: false, save }) });
    await preSeedAdmin();
    expect(save).not.toHaveBeenCalled();
    expect(updateOne).toHaveBeenCalledWith({ _id: 1 }, { isSuperAdmin: true, isAdmin: true });
  });

  it('nový superadmin – náhodné nezahashované heslo (hashuje hook), nie username', async () => {
    findOne.mockReturnValue({ exec: async () => null });
    await preSeedAdmin();
    const data = create.mock.calls[0][0];
    expect(data.username).toBe('sa@example.com');
    expect(data.password).not.toBe('sa@example.com');
    expect(data.password).not.toMatch(/^\$2[aby]\$/); // nie je to už bcrypt hash
    expect(data.password.length).toBeGreaterThanOrEqual(32);
  });

  it('bez SUPERADMIN_USERNAME sa preseed preskočí', async () => {
    delete process.env.SUPERADMIN_USERNAME;
    await preSeedAdmin();
    expect(findOne).not.toHaveBeenCalled();
  });
});
