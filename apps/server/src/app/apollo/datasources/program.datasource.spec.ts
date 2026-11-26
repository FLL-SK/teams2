import { ObjectId } from 'mongodb';
import { ApolloContext } from '../apollo-context';
import { UserGuard } from '../../utils/user-guard';
import { ProgramDataSource } from './program.datasource';

const { exists, findByIdAndUpdate, findByIdAndDelete } = vi.hoisted(() => ({
  exists: vi.fn(),
  findByIdAndUpdate: vi.fn(),
  findByIdAndDelete: vi.fn(),
}));
vi.mock('../../models', async (importOriginal) => {
  const original = await importOriginal<typeof import('../../models')>();
  return {
    ...original,
    registrationRepository: { exists },
    programRepository: { findByIdAndUpdate, findByIdAndDelete },
  };
});

const adminId = new ObjectId();
const ds = (isAdmin: boolean) =>
  new ProgramDataSource({
    context: {
      user: { _id: adminId },
      userGuard: new UserGuard({ _id: adminId, username: 'a@example.com', isAdmin } as never),
    } as unknown as ApolloContext,
  });

describe('ProgramDataSource.deleteProgram – soft delete (#285)', () => {
  const id = new ObjectId();
  beforeEach(() => {
    vi.clearAllMocks();
    findByIdAndUpdate.mockReturnValue({
      exec: async () => ({ _id: id, name: 'P', deletedOn: new Date() }),
    });
  });

  it('nastaví deletedOn/deletedBy namiesto zmazania', async () => {
    exists.mockResolvedValue(null);
    await ds(true).deleteProgram(id);
    expect(findByIdAndDelete).not.toHaveBeenCalled();
    expect(findByIdAndUpdate).toHaveBeenCalledWith(
      id,
      { deletedOn: expect.any(Date), deletedBy: adminId },
      { returnDocument: 'after' },
    );
  });

  it('program s aktívnymi registráciami sa nezmaže', async () => {
    exists.mockResolvedValue({ _id: 1 });
    await expect(ds(true).deleteProgram(id)).rejects.toThrow(/aktívne registrácie/);
    expect(findByIdAndUpdate).not.toHaveBeenCalled();
  });

  it('mazanie a obnovenie iba admin', async () => {
    await expect(ds(false).deleteProgram(id)).rejects.toThrow(/Not authorized/);
    await expect(ds(false).undeleteProgram(id)).rejects.toThrow(/Not authorized/);
    await ds(true).undeleteProgram(id);
    expect(findByIdAndUpdate).toHaveBeenCalledWith(
      id,
      { $unset: { deletedOn: null, deletedBy: null } },
      { returnDocument: 'after' },
    );
  });
});
