import { ObjectId } from 'mongodb';
import { ApolloContext } from '../apollo-context';
import { UserGuard } from '../../utils/user-guard';
import { TeamDataSource } from './team.datasource';

const { registrationFindOne } = vi.hoisted(() => ({ registrationFindOne: vi.fn() }));

vi.mock('../../models', async (importOriginal) => {
  const original = await importOriginal<typeof import('../../models')>();
  return { ...original, registrationRepository: { findOne: registrationFindOne } };
});

const contextWith = (events: ObjectId[], programs: ObjectId[]) => {
  const userGuard = new UserGuard({ _id: new ObjectId(), username: 'u@example.com' } as never);
  vi.spyOn(userGuard, 'getManagedEvents').mockResolvedValue(events.map(String));
  vi.spyOn(userGuard, 'getManagedPrograms').mockResolvedValue(programs.map(String));
  const context = { user: {}, userGuard } as unknown as ApolloContext;
  return context;
};

// Regresia #279: s nenačítanou cache UserGuard išiel do filtra `{ eventId: undefined }`,
// čo v MongoDB zodpovedá každej registrácii do programu – ktokoľvek videl trénerov tímu.
describe('TeamDataSource.isTeamRegisteredOnEventManagedByLoggedInUser', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    registrationFindOne.mockReturnValue({ lean: () => ({ exec: async () => ({ _id: 1 }) }) });
  });

  it('používateľ bez spravovaných turnajov a programov – false bez dotazu do DB', async () => {
    const ds = new TeamDataSource({ context: contextWith([], []) });
    expect(await ds.isTeamRegisteredOnEventManagedByLoggedInUser(new ObjectId())).toBe(false);
    expect(registrationFindOne).not.toHaveBeenCalled();
  });

  it('dotaz obsahuje iba spravované turnaje/programy ako ObjectId ($in)', async () => {
    const teamId = new ObjectId();
    const eventId = new ObjectId();
    const ds = new TeamDataSource({ context: contextWith([eventId], []) });

    expect(await ds.isTeamRegisteredOnEventManagedByLoggedInUser(teamId)).toBe(true);
    expect(registrationFindOne).toHaveBeenCalledWith({
      teamId,
      $or: [{ eventId: { $in: [eventId] } }],
    });
  });
});
