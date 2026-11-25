import { startTestServer, TestServer } from '../test-server';
import * as G from '../client-documents';

describe('GraphQL dotazy (admin)', () => {
  let srv: TestServer;
  let token: string;

  beforeAll(async () => {
    srv = await startTestServer();
    token = await srv.loginAs(srv.data.users.admin.username, srv.data.users.admin.password);
  });
  afterAll(async () => {
    await srv?.stop();
  });

  /** dotaz bez chýb, vráti `data` */
  const query = async <T>(doc: Parameters<TestServer['gql']>[0], vars = {}) => {
    const res = await srv.gql<T>(doc, vars, token);
    expect(res.errors).toBeUndefined();
    expect(res.status).toBe(200);
    return res.data as T;
  };

  it('getUser vráti používateľa aj s trénovanými tímami', async () => {
    const { users, teams } = srv.data;
    const d = await query<G.GetUserQuery>(G.GetUserDocument, { id: users.coach1.id });
    expect(d.getUser).toMatchObject({ id: users.coach1.id, username: users.coach1.username });
    expect(d.getUser?.coachingTeams.map((t) => t.id)).toEqual([teams.Team1]);
  });

  it('getUsers vráti všetkých používateľov', async () => {
    const d = await query<G.GetUsersQuery>(G.GetUsersDocument, { filter: {} });
    expect(d.getUsers).toHaveLength(9);
  });

  it('getTeams vráti aktívne tímy s tagmi a trénermi (DataLoader – regresia #276)', async () => {
    const { teams, tags, users } = srv.data;
    const d = await query<G.GetTeamsQuery>(G.GetTeamsDocument, { filter: {} });
    expect(d.getTeams.map((t) => t.name).sort()).toEqual(['Team1', 'Team2', 'Team3']);
    const team1 = d.getTeams.find((t) => t.id === teams.Team1)!;
    expect(team1.coaches.map((c) => c.id)).toEqual([users.coach1.id]);
    expect(team1.tags.map((t) => t.id).sort()).toEqual([tags.new, tags.school].sort());
  });

  it('getTeams filtruje podľa tagu', async () => {
    const { tags } = srv.data;
    const d = await query<G.GetTeamsQuery>(G.GetTeamsDocument, { filter: { hasTags: [tags.new] } });
    expect(d.getTeams.map((t) => t.name)).toEqual(['Team1']);
  });

  it('getTeam vráti detail tímu s registráciami', async () => {
    const { teams } = srv.data;
    const d = await query<G.GetTeamQuery>(G.GetTeamDocument, { id: teams.Team1 });
    expect(d.getTeam?.name).toBe('Team1');
    expect(d.getTeam?.registrations.length).toBeGreaterThan(0);
  });

  it('getPrograms a getProgram', async () => {
    const { programs, users } = srv.data;
    const list = await query<G.GetProgramsQuery>(G.GetProgramsDocument, { filter: {} });
    expect(list.getPrograms.map((p) => p.name)).toContain('Program1');
    const d = await query<G.GetProgramQuery>(G.GetProgramDocument, { id: programs.Program1 });
    expect(d.getProgram?.name).toBe('Program1');
    expect(d.getProgram?.managers.map((m) => m.id).sort()).toEqual(
      [users.progmgr1.id, users.progmgr2.id].sort(),
    );
  });

  it('getProgramRegistrations vráti registrácie do programu', async () => {
    const { programs, programRegistrations } = srv.data;
    const d = await query<G.GetProgramRegistrationsQuery>(G.GetProgramRegistrationsDocument, {
      programId: programs.Program1,
      includeNotConfirmed: true,
    });
    expect(d.getProgramRegistrations.map((r) => r.id)).toEqual(
      expect.arrayContaining([programRegistrations.Team1, programRegistrations.Team2]),
    );
  });

  it('getEvents, getEvent a getEventRegistrations', async () => {
    const { events, eventRegistrations, programs } = srv.data;
    const list = await query<G.GetEventsQuery>(G.GetEventsDocument, { filter: {} });
    expect(list.getEvents.map((e) => e.name).sort()).toEqual(['Event1', 'Event2', 'Event3']);

    const d = await query<G.GetEventQuery>(G.GetEventDocument, { id: events.Event2 });
    expect(d.getEvent).toMatchObject({ name: 'Event2', program: { id: programs.Program1 } });

    const regs = await query<G.GetEventRegistrationsQuery>(G.GetEventRegistrationsDocument, {
      eventId: events.Event2,
    });
    expect(regs.getEventRegistrations.map((r) => r.id).sort()).toEqual(
      [eventRegistrations['Event2/Team2'], eventRegistrations['Event2/Team3']].sort(),
    );
  });

  it('getRegistration vráti registráciu s tímom, programom a fakturačnými položkami', async () => {
    const { eventRegistrations, teams } = srv.data;
    const d = await query<G.GetRegistrationQuery>(G.GetRegistrationDocument, {
      id: eventRegistrations['Event1/Team1'],
    });
    expect(d.getRegistration).toMatchObject({
      team: { id: teams.Team1, name: 'Team1' },
      program: { name: 'Program1' },
      event: { name: 'Event1' },
      type: 'CLASS_PACK',
    });
    // Event1 nemá vlastné položky – použijú sa položky programu
    expect(d.getRegistration?.invoiceItems.map((i) => i.text).sort()).toEqual(['Item1', 'Item2']);
  });

  it('getRegistrationsCount', async () => {
    const d = await query<G.GetRegistrationsCountQuery>(G.GetRegistrationsCountDocument, {
      filter: {},
    });
    expect(d.getRegistrationsCount).toBeTruthy();
  });

  it('getNotes vráti poznámky tímu aj s autorom (DataLoader – regresia #276)', async () => {
    const { teams, users } = srv.data;
    const d = await query<G.GetNotesQuery>(G.GetNotesDocument, { type: 'team', ref: teams.Team1 });
    expect(d.getNotes).toHaveLength(5);
    expect(d.getNotes.map((n) => n.creator?.id)).toContain(users.admin.id);
  });

  it('getTags (aj so zmazanými) a getSettings', async () => {
    const all = await query<G.GetTagsQuery>(G.GetTagsDocument, { includeDeleted: true });
    expect(all.getTags).toHaveLength(3);
    const s = await query<G.GetSettingsQuery>(G.GetSettingsDocument);
    expect(s.getSettings).toBeTruthy();
  });
});
