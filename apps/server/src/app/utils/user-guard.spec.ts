import { ObjectId } from 'mongodb';
import { UserGuard } from './user-guard';
import { UserDataNoPassword } from '../models';

const { findTeamsCoachedByUser, countDocuments } = vi.hoisted(() => ({
  findTeamsCoachedByUser: vi.fn(),
  countDocuments: vi.fn(),
}));

vi.mock('../models', () => ({
  teamRepository: { findTeamsCoachedByUser },
  registrationRepository: { countDocuments },
  eventRepository: {},
  programRepository: {},
}));

const coachTeamId = new ObjectId();
const otherTeamId = new ObjectId();
const user = { _id: new ObjectId(), username: 'coach@example.com' } as UserDataNoPassword;

describe('UserGuard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    findTeamsCoachedByUser.mockResolvedValue([{ _id: coachTeamId }]);
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
});
