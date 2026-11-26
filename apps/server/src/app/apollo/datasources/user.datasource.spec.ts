import { ObjectId } from 'mongodb';
import { ApolloContext } from '../apollo-context';
import { UserGuard } from '../../utils/user-guard';
import { UserDataSource } from './user.datasource';

const { findById, findByIdAndUpdate } = vi.hoisted(() => ({
  findById: vi.fn(),
  findByIdAndUpdate: vi.fn(),
}));

vi.mock('../../utils/mailer', () => ({ sendEmail: vi.fn(async () => undefined) }));
vi.mock('../../models', async (importOriginal) => {
  const original = await importOriginal<typeof import('../../models')>();
  return { ...original, userRepository: { findById, findByIdAndUpdate } };
});

const ctx = (user: { _id: ObjectId; isAdmin?: boolean }) =>
  ({
    user,
    userGuard: new UserGuard({ username: 'x@example.com', ...user } as never),
  }) as unknown as ApolloContext;

describe('UserDataSource.changePassword (#281)', () => {
  const id = new ObjectId();
  const userDoc = () => {
    const doc = {
      _id: id,
      username: 'a@example.com',
      password: 'stary-hash',
      save: vi.fn(async () => doc),
      toObject: () => ({ _id: id, username: 'a@example.com' }),
    };
    return doc;
  };

  beforeEach(() => vi.clearAllMocks());

  it('heslo sa ukladá cez save() (hook ho zahashuje), nie cez findByIdAndUpdate', async () => {
    const doc = userDoc();
    findById.mockReturnValue({ exec: async () => doc });
    const u = await new UserDataSource({ context: ctx({ _id: id }) }).changePassword(
      id,
      'noveheslo1',
    );
    expect(doc.password).toBe('noveheslo1');
    expect(doc.save).toHaveBeenCalledTimes(1);
    expect(findByIdAndUpdate).not.toHaveBeenCalled();
    expect(u?.username).toBe('a@example.com');
  });

  it('odmietne krátke heslo', async () => {
    findById.mockReturnValue({ exec: async () => userDoc() });
    await expect(
      new UserDataSource({ context: ctx({ _id: id }) }).changePassword(id, 'kratke'),
    ).rejects.toThrow(/aspoň 8 znakov/);
  });

  it('cudzí používateľ nemôže meniť heslo', async () => {
    await expect(
      new UserDataSource({ context: ctx({ _id: new ObjectId() }) }).changePassword(
        id,
        'noveheslo1',
      ),
    ).rejects.toThrow(/Not authorized/);
    expect(findById).not.toHaveBeenCalled();
  });
});
