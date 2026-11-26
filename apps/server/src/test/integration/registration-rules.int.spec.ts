import { startTestServer, TestServer } from '../test-server';
import * as G from '../client-documents';
import { eventRepository, registrationRepository } from '../../app/models';

/**
 * #283 – pravidlá registrácie a ceny jedla na serveri, #287 – opakovaná registrácia.
 * Seed: Event1 (o 10 dní, Team1), Event2 (pred 2 dňami, Team2 + Team3), Event3 (bez dátumu, Team3);
 * do Program1 sú registrované Team1 a Team2; coach1 → Team1.
 */
describe('pravidlá registrácie (#283, #287)', () => {
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

  const errorCodes = (p?: { errors?: { code: string }[] | null } | null) =>
    (p?.errors ?? []).map((e) => e.code);

  const registerToProgram = async (who: string, teamId: string, programId: string) =>
    (
      await srv.gql<G.CreateProgramRegistrationMutation>(
        G.CreateProgramRegistrationDocument,
        { programId, teamId, input: { type: 'NORMAL' } },
        tokens[who],
      )
    ).data?.createProgramRegistration;

  const registerToEvent = async (who: string, teamId: string, eventId: string) =>
    (
      await srv.gql<G.CreateEventRegistrationMutation>(
        G.CreateEventRegistrationDocument,
        { eventId, teamId, input: { type: 'NORMAL' } },
        tokens[who],
      )
    ).data?.createEventRegistration;

  // registrácia preberá fakturačnú adresu z tímu – v seede ju má iba Team1
  it('opakovaná registrácia do programu sa odmietne aj pri nepotvrdenej prvej (#287)', async () => {
    const { teams, programs } = srv.data;
    // admin – výnimka z povoleného typu registrácie (Program2 povoľuje iba CLASS_PACK)
    const first = await registerToProgram('admin', teams.Team1, programs.Program2);
    expect(errorCodes(first)).toEqual([]);
    expect(first?.registration?.confirmedOn ?? null).toBeNull();

    const second = await registerToProgram('admin', teams.Team1, programs.Program2);
    // presne tieto kódy – predtým `throw { name }`, pri inej chybe sa vracal kód "Error" (#298)
    expect(errorCodes(second)).toEqual(['registration_failed', 'team_already_registered']);
    const active = await registrationRepository.countDocuments({
      teamId: teams.Team1,
      programId: programs.Program2,
      eventId: null,
      canceledOn: null,
    });
    expect(active).toBe(1);
  });

  it('na turnaj, ktorý už prebehol, sa tréner neregistruje', async () => {
    const { teams, events } = srv.data;
    expect(errorCodes(await registerToEvent('coach1', teams.Team1, events.Event2))).toContain(
      'event_past',
    );
  });

  it('admin zaregistruje aj na turnaj, ktorý prebehol; opakovaná registrácia sa odmietne (#287)', async () => {
    const { teams, events } = srv.data;
    expect(errorCodes(await registerToEvent('admin', teams.Team1, events.Event2))).toEqual([]);
    expect(errorCodes(await registerToEvent('admin', teams.Team1, events.Event2))).toContain(
      'team_already_registered',
    );
  });

  it('turnaj na pozvánky a po termíne registrácie', async () => {
    const { teams, events } = srv.data;
    await eventRepository.updateOne({ _id: events.Event3 }, { invitationOnly: true });
    expect(errorCodes(await registerToEvent('coach1', teams.Team1, events.Event3))).toContain(
      'not_invited',
    );

    await eventRepository.updateOne(
      { _id: events.Event3 },
      { invitationOnly: false, registrationEnd: new Date(Date.now() - 3 * 86400000) },
    );
    expect(errorCodes(await registerToEvent('coach1', teams.Team1, events.Event3))).toContain(
      'registration_closed',
    );
  });

  it('cena a názov jedla sa berú z cenníka turnaja, nie od klienta (#283)', async () => {
    const regId = srv.data.eventRegistrations['Event1/Team1'];
    const event = await eventRepository.findById(srv.data.events.Event1).lean();
    const food1 = event!.foodTypes.find((f) => f.n === 'Food1')!;

    const res = await srv.gql<G.UpdateRegistrationFoodOrderMutation>(
      G.UpdateRegistrationFoodOrderDocument,
      {
        id: regId,
        order: {
          billTo: { name: 'Platca', street: 'Ulica 1', city: 'Mesto', zip: '12345' },
          items: [
            {
              productId: food1._id!.toString(),
              name: 'Zadarmo',
              quantity: 3,
              unitPrice: 0,
              price: 0,
            },
          ],
        },
      },
      tokens.admin,
    );
    expect(res.errors).toBeUndefined();
    const stored = (await registrationRepository.findById(regId).lean())!.foodOrder!;
    expect(stored.items).toHaveLength(1);
    expect(stored.items[0]).toMatchObject({
      name: 'Food1',
      quantity: 3,
      unitPrice: food1.up,
      price: 3 * food1.up,
    });
  });
});
