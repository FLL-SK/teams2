import { ObjectId } from 'mongodb';
import { ApolloContext } from '../apollo-context';
import {
  EventDataSource,
  ProgramDataSource,
  RegistrationDataSource,
  TagDataSource,
  TeamDataSource,
  UserDataSource,
} from './index';

const { userFind } = vi.hoisted(() => ({ userFind: vi.fn() }));

vi.mock('../../models', async (importOriginal) => {
  const original = await importOriginal<typeof import('../../models')>();
  return {
    ...original,
    userRepository: { ...original.userRepository, find: userFind },
  };
});

const context = { userGuard: {} } as unknown as ApolloContext;

// Regresia #276: BaseDataSource volá _initialize() v konštruktore. Pri sémantike
// "define" pre class fields (useDefineForClassFields, predvolené pre target >= ES2022)
// by deklarácia `private loader` v podtriede prepísala loader na undefined.
describe('BaseDataSource – DataLoadery inicializované v _initialize()', () => {
  it.each([
    ['EventDataSource', EventDataSource],
    ['ProgramDataSource', ProgramDataSource],
    ['RegistrationDataSource', RegistrationDataSource],
    ['TagDataSource', TagDataSource],
    ['TeamDataSource', TeamDataSource],
    ['UserDataSource', UserDataSource],
  ])('%s má po vytvorení nastavený loader', (_name, DataSource) => {
    const ds = new DataSource({ context }) as unknown as { loader?: { load: unknown } };
    expect(ds.loader).toBeDefined();
    expect(typeof ds.loader?.load).toBe('function');
  });

  it('UserDataSource.getUser načíta používateľa cez DataLoader', async () => {
    const id = new ObjectId();
    userFind.mockReturnValue({
      exec: async () => [
        { _id: id, username: 'user@example.com', firstName: 'Ján', lastName: 'Test' },
      ],
    });

    // používateľ smie vidieť kontakt (napr. sám seba) – inak by getUser skryl e-mail (#289)
    const ds = new UserDataSource({
      context: { userGuard: { canReadUserContact: async () => true } } as unknown as ApolloContext,
    });
    const user = await ds.getUser(id);

    expect(userFind).toHaveBeenCalledTimes(1);
    expect(user).toMatchObject({ id, username: 'user@example.com' });
  });
});
