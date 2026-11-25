import { ObjectId } from 'mongodb';
import { ApolloContext } from './apollo-context';
import { FileDataSource, RegistrationDataSource } from './datasources';
import {
  cancelRegistration,
  createEventRegistration,
  createProgramRegistration,
} from '../domains/registration';
import { UserGuard } from '../utils/user-guard';

// Regresia #279: asynchrónne kontroly UserGuard (isCoach, isCoachOfRegisteredTeamFor…)
// sa používali bez `await` – Promise je vždy truthy, takže kontrola vždy prešla.

const { registrationFindById, fileFind, groupRegistrations, getSignedUrlForUpload } = vi.hoisted(
  () => ({
    registrationFindById: vi.fn(),
    fileFind: vi.fn(),
    groupRegistrations: vi.fn(),
    getSignedUrlForUpload: vi.fn(async () => 'https://s3.test/upload'),
  }),
);

vi.mock('../utils/aws-s3', () => ({
  getSignedUrlForUpload,
  getSignedUrlForDownload: vi.fn(),
  deleteFileFromBucket: vi.fn(),
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
const deniedContext = (
  allow: Partial<Record<'isCoach' | 'isProgramManager' | 'isEventManager', boolean>> = {},
) => {
  const userGuard = new UserGuard({ _id: new ObjectId(), username: 'coach@example.com' } as never);
  vi.spyOn(userGuard, 'isCoach').mockResolvedValue(!!allow.isCoach);
  vi.spyOn(userGuard, 'isProgramManager').mockResolvedValue(!!allow.isProgramManager);
  vi.spyOn(userGuard, 'isEventManager').mockResolvedValue(!!allow.isEventManager);
  vi.spyOn(userGuard, 'isCoachOfRegisteredTeamForProgram').mockResolvedValue(false);
  vi.spyOn(userGuard, 'isCoachOfRegisteredTeamForEvent').mockResolvedValue(false);
  return { user: { _id: new ObjectId() }, userGuard } as unknown as ApolloContext;
};

const registrationDoc = () => ({
  _id: new ObjectId(),
  teamId: new ObjectId(),
  programId: new ObjectId(),
  eventId: new ObjectId(),
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

    it('cancelRegistration povolí správcovi turnaja aj programu', async () => {
      for (const allow of [{ isEventManager: true }, { isProgramManager: true }]) {
        const doc = registrationDoc();
        registrationFindById.mockReturnValue({ exec: async () => doc });
        const ds = new RegistrationDataSource({ context: deniedContext(allow) });
        vi.spyOn(ds, 'removeFoodOrder').mockResolvedValue(undefined as never);
        await ds.cancelRegistration(doc._id);
        expect(doc.save).toHaveBeenCalled();
      }
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

    it('upload URL pre súbory programu a turnaja iba pre admina', async () => {
      const input = { name: 'a.pdf', size: 1, contentType: 'application/pdf' };
      await expect(ds().getProgramFileUploadUrl(new ObjectId(), input)).rejects.toThrow(
        NOT_AUTHORIZED,
      );
      await expect(ds().getEventFileUploadUrl(new ObjectId(), input)).rejects.toThrow(
        NOT_AUTHORIZED,
      );
      expect(getSignedUrlForUpload).not.toHaveBeenCalled();
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

  describe('cancelRegistration (doména)', () => {
    const run = (reg: { confirmedOn?: Date }, allow: Parameters<typeof deniedContext>[0]) => {
      const ctx = deniedContext(allow);
      const registration = { id: new ObjectId(), ...registrationDoc(), ...reg };
      const dsCancel = vi.fn(async () => null);
      ctx.dataSources = {
        registration: {
          getRegistration: vi.fn(async () => registration),
          cancelRegistration: dsCancel,
        },
      } as never;
      return { result: cancelRegistration(registration.id, ctx), dsCancel };
    };

    it('cudzí používateľ nezruší nepotvrdenú registráciu', async () => {
      const { result, dsCancel } = run({}, {});
      expect((await result)?.errors?.[0]?.code).toBe('not_authorized');
      expect(dsCancel).not.toHaveBeenCalled();
    });

    it('tréner nezruší potvrdenú registráciu, nepotvrdenú áno', async () => {
      const confirmed = run({ confirmedOn: new Date() }, { isCoach: true });
      expect((await confirmed.result)?.errors?.[0]?.code).toBe('not_authorized');
      expect(confirmed.dsCancel).not.toHaveBeenCalled();

      const notConfirmed = run({}, { isCoach: true });
      await notConfirmed.result;
      expect(notConfirmed.dsCancel).toHaveBeenCalled();
    });

    it('správca turnaja zruší aj potvrdenú registráciu', async () => {
      const { result, dsCancel } = run({ confirmedOn: new Date() }, { isEventManager: true });
      await result;
      expect(dsCancel).toHaveBeenCalled();
    });
  });
});
