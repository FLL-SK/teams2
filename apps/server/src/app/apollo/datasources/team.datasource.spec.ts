import { ObjectId } from 'mongodb';
import { ApolloContext } from '../apollo-context';
import { UserGuard } from '../../utils/user-guard';
import { TeamDataSource } from './team.datasource';
import { TeamMapper } from '../mappers';

const { registrationDistinct, teamFind } = vi.hoisted(() => ({
  registrationDistinct: vi.fn(),
  teamFind: vi.fn(),
}));

vi.mock('../../models', async (importOriginal) => {
  const original = await importOriginal<typeof import('../../models')>();
  return {
    ...original,
    registrationRepository: { distinct: registrationDistinct },
    teamRepository: { ...original.teamRepository, find: teamFind },
  };
});

const guardWith = (
  events: ObjectId[],
  programs: ObjectId[],
  opts: { coachOf?: ObjectId[]; isAdmin?: boolean } = {},
) => {
  const userGuard = new UserGuard({
    _id: new ObjectId(),
    username: 'u@example.com',
    isAdmin: opts.isAdmin,
  } as never);
  vi.spyOn(userGuard, 'getManagedEvents').mockResolvedValue(events.map(String));
  vi.spyOn(userGuard, 'getManagedPrograms').mockResolvedValue(programs.map(String));
  vi.spyOn(userGuard, 'getCoachedTeams').mockResolvedValue((opts.coachOf ?? []).map(String));
  return userGuard;
};
const ds = (userGuard: UserGuard) =>
  new TeamDataSource({ context: { user: {}, userGuard } as unknown as ApolloContext });

// Regresia #279: s nenačítanou cache UserGuard išiel do filtra `{ eventId: undefined }`,
// čo v MongoDB zodpovedá každej registrácii do programu – ktokoľvek videl trénerov tímu.
describe('TeamDataSource.isTeamRegisteredOnEventManagedByLoggedInUser', () => {
  beforeEach(() => vi.clearAllMocks());

  it('používateľ bez spravovaných turnajov a programov – false bez dotazu do DB', async () => {
    expect(
      await ds(guardWith([], [])).isTeamRegisteredOnEventManagedByLoggedInUser(new ObjectId()),
    ).toBe(false);
    expect(registrationDistinct).not.toHaveBeenCalled();
  });

  it('dotaz obsahuje iba aktívne registrácie spravovaných turnajov/programov ($in ObjectId)', async () => {
    const teamId = new ObjectId();
    const eventId = new ObjectId();
    registrationDistinct.mockReturnValue({ exec: async () => [teamId] });
    const d = ds(guardWith([eventId], []));

    expect(await d.isTeamRegisteredOnEventManagedByLoggedInUser(teamId)).toBe(true);
    expect(await d.isTeamRegisteredOnEventManagedByLoggedInUser(new ObjectId())).toBe(false);
    expect(registrationDistinct).toHaveBeenCalledTimes(1); // výsledok je v cache pre požiadavku
    expect(registrationDistinct).toHaveBeenCalledWith('teamId', {
      canceledOn: null,
      $or: [{ eventId: { $in: [eventId] } }],
    });
  });
});

describe('TeamDataSource – čítanie tímov (#289)', () => {
  const teamId = new ObjectId();
  const teamDoc = {
    _id: teamId,
    name: 'Tím',
    coachesIds: [new ObjectId()],
    tagIds: [new ObjectId()],
    address: {
      name: 'ZŠ Hlavná',
      street: 'Hlavná 1',
      city: 'Bratislava',
      zip: '81101',
      companyNumber: '123',
      contactName: 'Jana',
      email: 'jana@example.com',
      phone: '0900',
    },
    billTo: { name: 'Platca', street: 'X', city: 'Y', zip: 'Z', companyNumber: '999' },
    createdOn: new Date(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    teamFind.mockReturnValue({
      exec: async () => [teamDoc],
      sort: () => ({ exec: async () => [teamDoc] }),
    });
    registrationDistinct.mockReturnValue({ exec: async () => [] });
  });

  it('cudzí používateľ dostane iba verejné údaje tímu', async () => {
    const t = await ds(guardWith([], [])).getTeam(teamId);
    expect(t).toEqual(TeamMapper.toPublicTeam(TeamMapper.toTeam(teamDoc as never)));
    expect(t?.name).toBe('Tím');
    expect(t?.address).toMatchObject({ name: 'ZŠ Hlavná', city: 'Bratislava', street: '' });
    expect(JSON.stringify(t)).not.toMatch(/jana@example.com|0900|Hlavná 1|999|123/);
    expect(t?.coachesIds).toEqual([]);
    expect(t?.billTo).toBeNull();
  });

  it('tréner tímu, správca turnaja s registrovaným tímom a admin dostanú celé údaje', async () => {
    const full = TeamMapper.toTeam(teamDoc as never);
    expect(await ds(guardWith([], [], { coachOf: [teamId] })).getTeam(teamId)).toEqual(full);
    expect(await ds(guardWith([], [], { isAdmin: true })).getTeam(teamId)).toEqual(full);
    registrationDistinct.mockReturnValue({ exec: async () => [teamId] });
    expect(await ds(guardWith([new ObjectId()], [])).getTeam(teamId)).toEqual(full);
  });

  it('getTeams vráti zoznam iba adminovi', async () => {
    expect(await ds(guardWith([], [])).getTeams({})).toEqual([]);
    expect(teamFind).not.toHaveBeenCalled();
    expect(await ds(guardWith([], [], { isAdmin: true })).getTeams({})).toHaveLength(1);
  });
});
