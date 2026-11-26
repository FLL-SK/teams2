import { ObjectId } from 'mongodb';
import { UserGuard } from './user-guard';
import { UserDataNoPassword } from '../models';

const {
  findTeamsCoachedByUser,
  countDocuments,
  findEventsManagedByUser,
  findProgramsManagedByUser,
  registrationDistinct,
  teamDistinct,
  eventExists,
} = vi.hoisted(() => ({
  findTeamsCoachedByUser: vi.fn(),
  countDocuments: vi.fn(),
  findEventsManagedByUser: vi.fn(),
  findProgramsManagedByUser: vi.fn(),
  registrationDistinct: vi.fn(),
  teamDistinct: vi.fn(),
  eventExists: vi.fn(),
}));

vi.mock('../models', () => ({
  teamRepository: { findTeamsCoachedByUser, distinct: teamDistinct },
  registrationRepository: { countDocuments, distinct: registrationDistinct },
  eventRepository: { findEventsManagedByUser, exists: eventExists },
  programRepository: { findProgramsManagedByUser },
}));

const coachTeamId = new ObjectId();
const managedEventId = new ObjectId();
const managedProgramId = new ObjectId();
const otherTeamId = new ObjectId();
const user = { _id: new ObjectId(), username: 'coach@example.com' } as UserDataNoPassword;

describe('UserGuard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    findTeamsCoachedByUser.mockResolvedValue([{ _id: coachTeamId }]);
    findEventsManagedByUser.mockResolvedValue([{ _id: managedEventId }]);
    findProgramsManagedByUser.mockResolvedValue([{ _id: managedProgramId }]);
  });

  it('getManagedEvents / getManagedPrograms načítajú zoznam aj bez predchádzajúcej kontroly', async () => {
    const g = new UserGuard(user);
    expect(await g.getManagedEvents()).toEqual([managedEventId.toString()]);
    expect(await g.getManagedPrograms()).toEqual([managedProgramId.toString()]);
    // cache – druhé volanie nejde do DB
    await g.getManagedEvents();
    expect(findEventsManagedByUser).toHaveBeenCalledTimes(1);
    expect(await new UserGuard(null).getManagedEvents()).toEqual([]);
  });

  it('isEventManager / isProgramManager / isCoach vrátia false pre prázdne ID', async () => {
    const g = new UserGuard(user);
    expect(await g.isEventManager(undefined as unknown as ObjectId)).toBe(false);
    expect(await g.isProgramManager(null as unknown as ObjectId)).toBe(false);
    expect(await g.isCoach(undefined as unknown as ObjectId)).toBe(false);
    expect(await g.isEventManager(managedEventId)).toBe(true);
    expect(await g.isProgramManager(managedProgramId)).toBe(true);
  });

  it('isCoach – iba pre trénovaný tím', async () => {
    const g = new UserGuard(user);
    expect(await g.isCoach(coachTeamId)).toBe(true);
    expect(await g.isCoach(otherTeamId)).toBe(false);
    expect(await new UserGuard(null).isCoach(coachTeamId)).toBe(false);
  });

  it('isCoachOfRegisteredTeamForProgram hľadá potvrdenú registráciu trénovaného tímu', async () => {
    const programId = new ObjectId();
    countDocuments.mockResolvedValue(1);

    expect(await new UserGuard(user).isCoachOfRegisteredTeamForProgram(programId)).toBe(true);
    expect(countDocuments).toHaveBeenCalledWith({
      programId,
      teamId: { $in: [coachTeamId] },
      confirmedOn: { $ne: null },
      canceledOn: null,
    });

    countDocuments.mockResolvedValue(0);
    expect(await new UserGuard(user).isCoachOfRegisteredTeamForProgram(programId)).toBe(false);
  });

  it('isCoachOfRegisteredTeamForEvent hľadá aktívnu registráciu trénovaného tímu (ObjectId)', async () => {
    const eventId = new ObjectId();
    countDocuments.mockResolvedValue(1);

    expect(await new UserGuard(user).isCoachOfRegisteredTeamForEvent(eventId)).toBe(true);
    expect(countDocuments).toHaveBeenCalledWith({
      eventId,
      teamId: { $in: [coachTeamId] },
      canceledOn: null,
    });

    countDocuments.mockResolvedValue(0);
    expect(await new UserGuard(user).isCoachOfRegisteredTeamForEvent(eventId)).toBe(false);
  });

  it('neprihlásený používateľ nie je trénerom registrovaného tímu', async () => {
    const g = new UserGuard(null);
    expect(await g.isCoachOfRegisteredTeamForProgram(new ObjectId())).toBe(false);
    expect(await g.isCoachOfRegisteredTeamForEvent(new ObjectId())).toBe(false);
    expect(countDocuments).not.toHaveBeenCalled();
  });

  describe('oprávnenia na čítanie (#280, #289)', () => {
    const managedTeamId = new ObjectId();
    const coId = new ObjectId();
    const managedCoachId = new ObjectId();

    beforeEach(() => {
      registrationDistinct.mockReturnValue({ exec: async () => [managedTeamId] });
      teamDistinct.mockReturnValue({ exec: async () => [coId, managedCoachId] });
    });

    it('superadmin je admin aj s isAdmin: false', () => {
      expect(new UserGuard({ ...user, isSuperAdmin: true, isAdmin: false }).isAdmin()).toBe(true);
      expect(new UserGuard({ ...user, isAdmin: false }).isAdmin()).toBe(false);
    });

    it('getManagedTeams – tímy aktívne registrované na spravovaných turnajoch/programoch, raz za požiadavku', async () => {
      const g = new UserGuard(user);
      expect(await g.isManagerOfTeam(managedTeamId)).toBe(true);
      expect(await g.isManagerOfTeam(otherTeamId)).toBe(false);
      expect(registrationDistinct).toHaveBeenCalledTimes(1);
      expect(registrationDistinct).toHaveBeenCalledWith('teamId', {
        canceledOn: null,
        $or: [{ eventId: { $in: [managedEventId] } }, { programId: { $in: [managedProgramId] } }],
      });
    });

    it('bez spravovaných turnajov a programov sa registrácie nehľadajú', async () => {
      findEventsManagedByUser.mockResolvedValue([]);
      findProgramsManagedByUser.mockResolvedValue([]);
      expect(await new UserGuard(user).isManagerOfTeam(managedTeamId)).toBe(false);
      expect(registrationDistinct).not.toHaveBeenCalled();
    });

    it('canReadRegistration – tréner tímu, správca programu alebo turnaja', async () => {
      const g = new UserGuard(user);
      const foreign = { teamId: otherTeamId, programId: new ObjectId(), eventId: new ObjectId() };
      expect(await g.canReadRegistration(foreign)).toBe(false);
      expect(await g.canReadRegistration({ ...foreign, teamId: coachTeamId })).toBe(true);
      expect(await g.canReadRegistration({ ...foreign, programId: managedProgramId })).toBe(true);
      expect(await g.canReadRegistration({ ...foreign, eventId: managedEventId })).toBe(true);
      expect(await new UserGuard(null).canReadRegistration(foreign)).toBe(false);
    });

    it('canReadUserContact – sám, spolutréner, tréner tímu na spravovanom turnaji, admin', async () => {
      const g = new UserGuard(user);
      expect(await g.canReadUserContact(user._id!)).toBe(true);
      expect(await g.canReadUserContact(coId)).toBe(true);
      expect(await g.canReadUserContact(managedCoachId)).toBe(true);
      expect(await g.canReadUserContact(new ObjectId())).toBe(false);
      expect(teamDistinct).toHaveBeenCalledWith('coachesIds', {
        _id: { $in: expect.arrayContaining([coachTeamId, managedTeamId]) },
      });
      expect(
        await new UserGuard({ ...user, isAdmin: true }).canReadUserContact(new ObjectId()),
      ).toBe(true);
    });

    it('isEventManagerInProgram – správca turnaja v danom programe', async () => {
      const programId = new ObjectId();
      eventExists.mockResolvedValue({ _id: managedEventId });
      expect(await new UserGuard(user).isEventManagerInProgram(programId)).toBe(true);
      expect(eventExists).toHaveBeenCalledWith({ _id: { $in: [managedEventId] }, programId });
      eventExists.mockResolvedValue(null);
      expect(await new UserGuard(user).isEventManagerInProgram(programId)).toBe(false);
    });
  });

  describe('require (#297)', () => {
    it('prejde, ak prejde aspoň jedna kontrola, a ďalšie už nevyhodnocuje', async () => {
      const g = new UserGuard(user);
      const later = vi.fn().mockResolvedValue(true);
      await expect(g.require('Akcia', true, later)).resolves.toBeUndefined();
      expect(later).not.toHaveBeenCalled();
    });

    it('vyhodnocuje kontroly postupne – sync hodnota aj (async) funkcia', async () => {
      const g = new UserGuard(user);
      const order: string[] = [];
      const first = vi.fn(() => {
        order.push('first');
        return false;
      });
      const second = vi.fn(async () => {
        order.push('second');
        return true;
      });
      const third = vi.fn(() => true);
      await g.require('Akcia', false, first, second, third);
      expect(order).toEqual(['first', 'second']);
      expect(third).not.toHaveBeenCalled();
    });

    it('asynchrónna kontrola sa naozaj čaká – false z Promise nie je pravdivý (#279)', async () => {
      const g = new UserGuard(user);
      await expect(g.require('Update team', () => g.isCoach(otherTeamId))).rejects.toThrow(
        'Not authorized: Update team',
      );
      await expect(g.require('Update team', () => g.isCoach(coachTeamId))).resolves.toBeUndefined();
    });

    it('zamietne, ak neprejde žiadna kontrola (aj bez kontrol)', async () => {
      const g = new UserGuard(user);
      await expect(
        g.require(
          'Delete team',
          false,
          () => false,
          async () => false,
        ),
      ).rejects.toThrow('(coach@example.com) Not authorized: Delete team');
      await expect(g.require('Delete team')).rejects.toThrow('Not authorized: Delete team');
      await expect(new UserGuard(null).require('Delete team', () => false)).rejects.toThrow(
        '(not-logged-in) Not authorized: Delete team',
      );
    });
  });
});
