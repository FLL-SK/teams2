import { parse } from 'graphql';
import { startTestServer, TestServer } from '../test-server';
import * as G from '../client-documents';
import { sendEmail } from '../../app/utils/mailer';

/**
 * #289 – oprávnenia na čítanie, #280 – chýbajúce kontroly (fakturácia, testovací e-mail, username).
 * Seed: coach1 → Team1, coach2 → Team2, coach3 → Team2 a Team3; všetky turnaje sú v Program1;
 * Event1: Team1, Event2: Team2 + Team3, Event3: Team3; do Program1 sú registrované Team1 a Team2.
 * eventmgr1 → Event1, eventmgr2 → Event1 + Event2, progmgr1/2 → Program1.
 */
describe('oprávnenia na čítanie (#289)', () => {
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

  const reg = (key: string) => srv.data.eventRegistrations[key];

  describe('registrácia', () => {
    const getReg = async (id: string, who: string) =>
      (await srv.gql<G.GetRegistrationQuery>(G.GetRegistrationDocument, { id }, tokens[who])).data
        ?.getRegistration;

    it('vidí ju admin, tréner tímu, správca turnaja a programu', async () => {
      for (const who of ['admin', 'coach1', 'eventmgr1', 'eventmgr2', 'progmgr1']) {
        expect(await getReg(reg('Event1/Team1'), who), who).toMatchObject({
          id: reg('Event1/Team1'),
        });
      }
    });

    it('cudzí tréner a správca iného turnaja ju nevidia', async () => {
      expect(await getReg(reg('Event1/Team1'), 'coach2')).toBeNull();
      expect(await getReg(reg('Event2/Team2'), 'eventmgr1')).toBeNull();
    });

    it('zoznam registrácií turnaja – tréner iba svoje tímy, správca všetky', async () => {
      const list = async (who: string) =>
        (
          await srv.gql<G.GetEventRegistrationsQuery>(
            G.GetEventRegistrationsDocument,
            { eventId: srv.data.events.Event2 },
            tokens[who],
          )
        ).data?.getEventRegistrations.map((r) => r.teamId) ?? [];
      expect(await list('coach1')).toEqual([]);
      expect(await list('coach2')).toEqual([srv.data.teams.Team2]);
      expect((await list('eventmgr2')).sort()).toEqual(
        [srv.data.teams.Team2, srv.data.teams.Team3].sort(),
      );
    });

    it('zoznam registrácií programu – tréner iba svoje tímy, správca turnaja v programe všetky', async () => {
      const list = async (who: string) =>
        (
          await srv.gql<G.GetProgramRegistrationsQuery>(
            G.GetProgramRegistrationsDocument,
            { programId: srv.data.programs.Program1 },
            tokens[who],
          )
        ).data?.getProgramRegistrations ?? [];
      const all = await list('admin');
      expect(all.length).toBeGreaterThan(1);
      expect((await list('coach1')).every((r) => r.teamId === srv.data.teams.Team1)).toBe(true);
      expect((await list('coach1')).length).toBeGreaterThan(0);
      // správca turnaja na pozvánky tímov programu
      expect(await list('eventmgr1')).toHaveLength(all.length);
    });
  });

  describe('tímy', () => {
    const getTeam = async (id: string, who: string) =>
      (await srv.gql<G.GetTeamQuery>(G.GetTeamDocument, { id }, tokens[who])).data?.getTeam;

    it('cudzí používateľ vidí iba názov tímu, organizáciu a mesto', async () => {
      const t = await getTeam(srv.data.teams.Team2, 'coach1');
      expect(t?.name).toBe('Team2');
      expect(t?.address.street).toBe('');
      expect(t?.address.zip).toBe('');
      expect(t?.coachesIds).toEqual([]);
      expect(t?.billTo ?? null).toBeNull();
      // správca turnaja, na ktorom Team2 nie je
      expect((await getTeam(srv.data.teams.Team2, 'eventmgr1'))?.address.street).toBe('');
    });

    it('tréner tímu, správca turnaja s tímom a správca programu vidia adresu', async () => {
      for (const who of ['coach2', 'eventmgr2', 'progmgr1', 'admin']) {
        expect((await getTeam(srv.data.teams.Team2, who))?.address.street, who).not.toBe('');
      }
    });

    it('zoznam všetkých tímov iba pre admina', async () => {
      const list = async (who: string) =>
        (await srv.gql<G.GetTeamsQuery>(G.GetTeamsDocument, { filter: {} }, tokens[who])).data
          ?.getTeams ?? [];
      expect(await list('coach1')).toEqual([]);
      expect(await list('eventmgr1')).toEqual([]);
      expect((await list('admin')).length).toBeGreaterThanOrEqual(3);
    });
  });

  describe('používatelia', () => {
    // klientsky dotaz getUser (UserFragment) sa používa iba pre prihláseného používateľa –
    // pre iných sa pýtame iba na kontaktné polia (rovnako ich čítajú Team.coaches, Registration.createdByUser …)
    const GetUserContact = parse('query ($id: ID!) { getUser(id: $id) { id username phone } }');
    const getUser = async (id: string, who: string) =>
      (
        await srv.gql<{ getUser: { id: string; username: string; phone: string } | null }>(
          GetUserContact,
          { id },
          tokens[who],
        )
      ).data?.getUser;

    it('cudzí tréner nevidí e-mail ani telefón iného trénera', async () => {
      const u = await getUser(srv.data.users.coach2.id, 'coach1');
      expect(u?.id).toBe(srv.data.users.coach2.id);
      expect(u?.username).toBe('');
      expect(u?.phone ?? '').toBe('');
    });

    it('kontakt vidí používateľ sám, spolutréner, správca turnaja s tímom a admin', async () => {
      const coach2 = srv.data.users.coach2;
      for (const who of ['coach2', 'coach3', 'eventmgr2', 'admin']) {
        expect((await getUser(coach2.id, who))?.username, who).toBe(coach2.username);
      }
      // eventmgr1 spravuje iba Event1, kde Team2 nie je
      expect((await getUser(coach2.id, 'eventmgr1'))?.username).toBe('');
    });
  });

  describe('tímy na turnaji', () => {
    const teams = async (who: string) =>
      (
        await srv.gql<G.GetRegisteredTeamsQuery>(
          G.GetRegisteredTeamsDocument,
          { eventId: srv.data.events.Event2, includeCoaches: true },
          tokens[who],
        )
      ).data?.getRegisteredTeams ?? [];

    it('zoznam vidí každý, adresu, platbu a objednávku iba správca a tréner daného tímu', async () => {
      const foreign = await teams('coach1');
      expect(foreign.map((t) => t.name).sort()).toEqual(['Team2', 'Team3']);
      for (const t of foreign) {
        expect(t.address.street).toBe('');
        expect(t.foodOrder).toBeNull();
        expect(t.paidOn).toBeNull();
        expect(t.coaches ?? []).toEqual([]);
      }

      const own = await teams('coach2');
      expect(own.find((t) => t.name === 'Team2')?.address.street).not.toBe('');
      expect(own.find((t) => t.name === 'Team3')?.address.street).toBe('');

      const mgr = await teams('eventmgr2');
      expect(mgr.every((t) => t.address.street !== '')).toBe(true);
      expect(mgr.some((t) => (t.coaches ?? []).length > 0)).toBe(true);
    });
  });
});

describe('chýbajúce kontroly oprávnení (#280)', () => {
  let srv: TestServer;
  const tokens: Record<string, string> = {};

  beforeAll(async () => {
    srv = await startTestServer();
    for (const key of ['admin', 'coach1'] as const) {
      const u = srv.data.users[key];
      tokens[key] = await srv.loginAs(u.username, u.password);
    }
  });
  afterAll(async () => {
    await srv?.stop();
  });

  const denied = (res: { errors?: { message: string }[] }) =>
    expect(res.errors?.[0]?.message).toMatch(/Not authorized/);

  it('sendTestEmail – iba admin', async () => {
    vi.mocked(sendEmail).mockClear();
    denied(await srv.gql(G.SendTestEmailDocument, { to: 'x@example.com' }, tokens.coach1));
    expect(sendEmail).not.toHaveBeenCalled();
    const ok = await srv.gql(G.SendTestEmailDocument, { to: 'x@example.com' }, tokens.admin);
    expect(ok.errors).toBeUndefined();
    expect(sendEmail).toHaveBeenCalledTimes(1);
  });

  it('vystavenie a odoslanie faktúry registrácie – iba admin (pred volaním SuperFaktúry)', async () => {
    const id = srv.data.eventRegistrations['Event1/Team1'];
    denied(await srv.gql(G.CreateRegistrationInvoiceDocument, { id }, tokens.coach1));
    denied(await srv.gql(G.EmailRegistrationInvoiceDocument, { id }, tokens.coach1));
  });

  it('zmena username – iba admin a iba na platný e-mail', async () => {
    const { id } = srv.data.users.coach1;
    denied(
      await srv.gql(
        G.UpdateUserDocument,
        { id, input: { username: 'novy@example.com', usernameOverride: true } },
        tokens.coach1,
      ),
    );
    const invalid = await srv.gql(
      G.UpdateUserDocument,
      { id, input: { username: 'neplatny', usernameOverride: true } },
      tokens.admin,
    );
    expect(invalid.errors?.[0]?.message).toMatch(/valid email/);
    // bežná úprava profilu trénerom funguje
    const ok = await srv.gql(
      G.UpdateUserDocument,
      { id, input: { firstName: 'Nové' } },
      tokens.coach1,
    );
    expect(ok.errors).toBeUndefined();
  });
});
