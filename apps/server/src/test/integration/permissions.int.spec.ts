import { startTestServer, TestServer } from '../test-server';
import * as G from '../client-documents';
import { registrationRepository } from '../../app/models';

/**
 * Kontroly oprávnení cez celý server (JWT -> kontext -> UserGuard -> datasource).
 * Seed: coach1 trénuje Team1, coach2 Team2, coach3 Team2 a Team3;
 * eventmgr1 spravuje Event1, eventmgr2 Event1 a Event2; progmgr1/2 spravujú Program1.
 */
describe('oprávnenia', () => {
  let srv: TestServer;
  const tokens: Record<string, string> = {};

  beforeAll(async () => {
    srv = await startTestServer();
    for (const [key, u] of Object.entries(srv.data.users)) {
      tokens[key] = await srv.loginAs(u.username, u.password);
    }
  });
  afterAll(async () => {
    await srv?.stop();
  });

  const expectDenied = (res: Awaited<ReturnType<TestServer['gql']>>) => {
    expect(res.errors?.[0]?.message).toMatch(/not authorized|Not authorized|nemáte|oprávn/i);
    // zamietnutý prístup má kód FORBIDDEN – klient podľa neho zobrazí slovenskú hlášku (#298)
    expect(res.errors?.[0]?.extensions?.code).toBe('FORBIDDEN');
  };
  const expectAllowed = (res: Awaited<ReturnType<TestServer['gql']>>) => {
    expect(res.errors).toBeUndefined();
  };

  describe('používatelia a nastavenia', () => {
    it('tréner nevidí zoznam používateľov', async () => {
      expectDenied(await srv.gql(G.GetUsersDocument, { filter: {} }, tokens.coach1));
    });

    it('tréner nemôže meniť nastavenia, admin áno', async () => {
      const input = { sysEmail: 'sys@example.com' };
      expectDenied(await srv.gql(G.UpdateSettingsDocument, { input }, tokens.coach1));
      expectAllowed(await srv.gql(G.UpdateSettingsDocument, { input }, tokens.admin));
    });

    it('tréner nemôže pridávať tagy tímu', async () => {
      const { teams, tags } = srv.data;
      expectDenied(
        await srv.gql(
          G.AddTagsToTeamDocument,
          { teamId: teams.Team3, tagIds: [tags.new] },
          tokens.coach1,
        ),
      );
    });
  });

  describe('tímy', () => {
    it('cudzí tréner nevidí trénerov (kontakty) tímu, správca turnaja áno (#279)', async () => {
      const { teams, users } = srv.data;
      // coach2 nemá s Team1 nič spoločné
      const foreign = await srv.gql<G.GetTeamQuery>(
        G.GetTeamDocument,
        { id: teams.Team1 },
        tokens.coach2,
      );
      expect(foreign.data?.getTeam?.coaches).toEqual([]);

      // eventmgr1 spravuje Event1, na ktorý je Team1 registrovaný
      const manager = await srv.gql<G.GetTeamQuery>(
        G.GetTeamDocument,
        { id: teams.Team1 },
        tokens.eventmgr1,
      );
      expect(manager.data?.getTeam?.coaches.map((c) => c.id)).toEqual([users.coach1.id]);

      // vlastný tréner
      const own = await srv.gql<G.GetTeamQuery>(
        G.GetTeamDocument,
        { id: teams.Team1 },
        tokens.coach1,
      );
      expect(own.data?.getTeam?.coaches.map((c) => c.id)).toEqual([users.coach1.id]);
    });

    it('tréner môže upraviť svoj tím, cudzí nie', async () => {
      const { teams } = srv.data;
      expectAllowed(
        await srv.gql(
          G.UpdateTeamDocument,
          { id: teams.Team1, input: { name: 'Team1' } },
          tokens.coach1,
        ),
      );
      expectDenied(
        await srv.gql(
          G.UpdateTeamDocument,
          { id: teams.Team2, input: { name: 'X' } },
          tokens.coach1,
        ),
      );
    });
  });

  describe('registrácie', () => {
    const canceledOn = async (id: string) =>
      (await registrationRepository.findById(id).exec())?.canceledOn ?? null;

    it('tréner nemôže zrušiť registráciu cudzieho tímu (#279)', async () => {
      const id = srv.data.eventRegistrations['Event2/Team2'];
      const res = await srv.gql<G.CancelRegistrationMutation>(
        G.CancelRegistrationDocument,
        { id },
        tokens.coach1,
      );
      expect(res.data?.cancelRegistration?.registration).toBeFalsy();
      // rozhoduje stav v DB – chyba môže prísť aj z neskoršieho kroku
      expect(await canceledOn(id)).toBeNull();
    });

    it('tréner nemôže zrušiť potvrdenú registráciu svojho tímu (#279)', async () => {
      const id = srv.data.programRegistrations.Team1; // potvrdená, coach1
      const res = await srv.gql<G.CancelRegistrationMutation>(
        G.CancelRegistrationDocument,
        { id },
        tokens.coach1,
      );
      expect(res.data?.cancelRegistration.errors?.[0]?.code).toBe('not_authorized');
      expect(await canceledOn(id)).toBeNull();
    });

    it('tréner nemôže zrušiť registráciu do programu s aktívnymi registráciami na turnaj', async () => {
      const id = srv.data.programRegistrations.Team2; // nepotvrdená, coach2, Team2 je na Event2
      const res = await srv.gql<G.CancelRegistrationMutation>(
        G.CancelRegistrationDocument,
        { id },
        tokens.coach2,
      );
      expect(res.data?.cancelRegistration.errors?.[0]?.code).toBe('cannot_cancel');
      expect(await canceledOn(id)).toBeNull();
    });

    it('tréner zruší nepotvrdenú registráciu svojho tímu bez chyby (#279)', async () => {
      const id = srv.data.eventRegistrations['Event3/Team3']; // nepotvrdená, coach3
      const res = await srv.gql<G.CancelRegistrationMutation>(
        G.CancelRegistrationDocument,
        { id },
        tokens.coach3,
      );
      expect(res.errors).toBeUndefined();
      expect(res.data?.cancelRegistration.errors ?? []).toEqual([]);
      expect(res.data?.cancelRegistration.registration?.canceledOn).toBeTruthy();
      expect(await canceledOn(id)).not.toBeNull();

      // opakované zrušenie sa odmietne
      const again = await srv.gql<G.CancelRegistrationMutation>(
        G.CancelRegistrationDocument,
        { id },
        tokens.coach3,
      );
      expect(again.data?.cancelRegistration.errors?.[0]?.code).toBe('already_canceled');
    });

    it('správca turnaja zruší registráciu na svojom turnaji (#279)', async () => {
      const id = srv.data.eventRegistrations['Event1/Team1'];
      const res = await srv.gql<G.CancelRegistrationMutation>(
        G.CancelRegistrationDocument,
        { id },
        tokens.eventmgr1,
      );
      expect(res.errors).toBeUndefined();
      expect(await canceledOn(id)).not.toBeNull();
    });

    it('tréner nemôže meniť veľkosť cudzieho tímu, svojho áno', async () => {
      const { eventRegistrations } = srv.data;
      const input = { girlCount: 1, boyCount: 1, coachCount: 1 };
      expectDenied(
        await srv.gql(
          G.RegistrationSetTeamSizeDocument,
          { id: eventRegistrations['Event2/Team2'], input },
          tokens.coach1,
        ),
      );
      expectAllowed(
        await srv.gql(
          G.RegistrationSetTeamSizeDocument,
          { id: eventRegistrations['Event1/Team1'], input },
          tokens.coach1,
        ),
      );
    });

    it('tréner nemôže registrovať cudzí tím do programu ani na turnaj', async () => {
      const { programs, events, teams } = srv.data;
      // registrácia vracia chyby v payloade (RegistrationPayload.errors)
      const prog = await srv.gql<G.CreateProgramRegistrationMutation>(
        G.CreateProgramRegistrationDocument,
        { programId: programs.Program2, teamId: teams.Team3, input: { type: 'CLASS_PACK' } },
        tokens.coach1,
      );
      expect(prog.data?.createProgramRegistration.errors?.[0]?.code).toBe('not_authorized');
      expect(prog.data?.createProgramRegistration.registration).toBeFalsy();

      const event = await srv.gql<G.CreateEventRegistrationMutation>(
        G.CreateEventRegistrationDocument,
        { eventId: events.Event1, teamId: teams.Team3, input: {} },
        tokens.coach1,
      );
      expect(event.data?.createEventRegistration.errors?.[0]?.code).toBe('not_authorized');
      expect(event.data?.createEventRegistration.registration).toBeFalsy();
    });

    it('tréner nemôže potvrdiť registráciu (iba admin)', async () => {
      const { programRegistrations } = srv.data;
      const vars = { id: programRegistrations.Team2, date: new Date().toISOString() };
      expectDenied(await srv.gql(G.RegistrationSetConfirmedDocument, vars, tokens.coach2));
    });
  });

  describe('súbory programu a turnaja', () => {
    it('tréner tímu potvrdene registrovaného v programe vidí súbory programu, iný tréner nie', async () => {
      const { programs } = srv.data;
      // Team1 (coach1) má potvrdenú registráciu do Program1, Team3 (coach3) nie
      expectAllowed(
        await srv.gql(G.GetProgramFilesDocument, { programId: programs.Program1 }, tokens.coach1),
      );
      expectDenied(
        await srv.gql(G.GetProgramFilesDocument, { programId: programs.Program1 }, tokens.coach3),
      );
    });

    it('tréner tímu registrovaného na turnaj vidí súbory turnaja, iný tréner nie', async () => {
      const { events } = srv.data;
      // Team2 (coach2) je registrovaný na Event2, Team1 (coach1) nie
      expectAllowed(
        await srv.gql(G.GetEventFilesDocument, { eventId: events.Event2 }, tokens.coach2),
      );
      expectDenied(
        await srv.gql(G.GetEventFilesDocument, { eventId: events.Event2 }, tokens.coach1),
      );
    });
  });

  describe('turnaje', () => {
    it('správca turnaja môže upraviť svoj turnaj, cudzí nie', async () => {
      const { events } = srv.data;
      expectAllowed(
        await srv.gql(
          G.UpdateEventDocument,
          { id: events.Event1, input: { name: 'Event1' } },
          tokens.eventmgr1,
        ),
      );
      expectDenied(
        await srv.gql(
          G.UpdateEventDocument,
          { id: events.Event2, input: { name: 'X' } },
          tokens.eventmgr1,
        ),
      );
    });

    it('správca programu môže upraviť turnaj vo svojom programe', async () => {
      const { events } = srv.data;
      expectAllowed(
        await srv.gql(
          G.UpdateEventDocument,
          { id: events.Event3, input: { name: 'Event3' } },
          tokens.progmgr2,
        ),
      );
    });
  });
});
