import { ObjectId } from 'mongodb';
import { ApolloContext } from './apollo-context';
import { FileDataSource, RegistrationDataSource } from './datasources';
import { createEventRegistration, createProgramRegistration } from '../domains/registration';
import { UserGuard } from '../utils/user-guard';

// Regresia #279: asynchrónne kontroly UserGuard (isCoach, isCoachOfRegisteredTeamFor…)
// sa používali bez `await` – Promise je vždy truthy, takže kontrola vždy prešla.

const { registrationFindById, fileFind, groupRegistrations } = vi.hoisted(() => ({
  registrationFindById: vi.fn(),
  fileFind: vi.fn(),
  groupRegistrations: vi.fn(),
}));

vi.mock('../models', async (importOriginal) => {
  const original = await importOriginal<typeof import('../models')>();
  return {
    ...original,
    registrationRepository: { findById: registrationFindById, groupRegistrations },
    fileRepository: { find: fileFind },
  };
});

const NOT_AUTHORIZED = /Not authorized/;

/** prihlásený používateľ bez oprávnení – asynchrónne kontroly vrátia false */
const deniedContext = () => {
  const userGuard = new UserGuard({ _id: new ObjectId(), username: 'coach@example.com' } as never);
  vi.spyOn(userGuard, 'isCoach').mockResolvedValue(false);
  vi.spyOn(userGuard, 'isCoachOfRegisteredTeamForProgram').mockResolvedValue(false);
  vi.spyOn(userGuard, 'isCoachOfRegisteredTeamForEvent').mockResolvedValue(false);
  return { user: { _id: new ObjectId() }, userGuard } as unknown as ApolloContext;
};

const registrationDoc = () => ({
  _id: new ObjectId(),
  teamId: new ObjectId(),
  save: vi.fn(),
});

describe('autorizácia s asynchrónnymi kontrolami (regresia #279)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    registrationFindById.mockReturnValue({ exec: async () => registrationDoc() });
    fileFind.mockReturnValue({ sort: () => ({ exec: async () => [] }) });
    groupRegistrations.mockResolvedValue([]);
  });

  describe('RegistrationDataSource', () => {
    const ds = () => new RegistrationDataSource({ context: deniedContext() });
    const id = new ObjectId();

    it('cancelRegistration odmietne cudzieho trénera', async () => {
      await expect(ds().cancelRegistration(id)).rejects.toThrow(NOT_AUTHORIZED);
    });

    it('setTeamSize odmietne cudzieho trénera', async () => {
      await expect(
        ds().setTeamSize(id, { girlCount: 1, boyCount: 1, coachCount: 1 }),
      ).rejects.toThrow(NOT_AUTHORIZED);
    });

    it('setTeamSizeConfirmedOn odmietne cudzieho trénera', async () => {
      await expect(ds().setTeamSizeConfirmedOn(id, new Date())).rejects.toThrow(NOT_AUTHORIZED);
    });

    it('clearTeamSizeConfirmedOn odmietne cudzieho trénera', async () => {
      await expect(ds().clearTeamSizeConfirmedOn(id)).rejects.toThrow(NOT_AUTHORIZED);
    });

    it('nič neuloží, keď oprávnenie chýba', async () => {
      const doc = registrationDoc();
      registrationFindById.mockReturnValue({ exec: async () => doc });
      await expect(
        ds().setTeamSize(id, { girlCount: 1, boyCount: 1, coachCount: 1 }),
      ).rejects.toThrow();
      expect(doc.save).not.toHaveBeenCalled();
    });
  });

  describe('FileDataSource', () => {
    const ds = () => new FileDataSource({ context: deniedContext() });

    it('getProgramFiles odmietne trénera bez registrácie v programe', async () => {
      await expect(ds().getProgramFiles(new ObjectId())).rejects.toThrow(NOT_AUTHORIZED);
      expect(fileFind).not.toHaveBeenCalled();
    });

    it('getEventFiles odmietne trénera bez registrácie na turnaj', async () => {
      await expect(ds().getEventFiles(new ObjectId())).rejects.toThrow(NOT_AUTHORIZED);
      expect(fileFind).not.toHaveBeenCalled();
    });
  });

  describe('registrácia tímu', () => {
    it('createProgramRegistration odmietne cudzieho trénera', async () => {
      await expect(
        createProgramRegistration(
          new ObjectId(),
          new ObjectId(),
          { type: 'NORMAL' },
          deniedContext(),
        ),
      ).rejects.toThrow(NOT_AUTHORIZED);
      expect(groupRegistrations).not.toHaveBeenCalled();
    });

    it('createEventRegistration odmietne cudzieho trénera', async () => {
      await expect(
        createEventRegistration(new ObjectId(), new ObjectId(), {}, deniedContext()),
      ).rejects.toThrow(NOT_AUTHORIZED);
      expect(groupRegistrations).not.toHaveBeenCalled();
    });
  });
});
