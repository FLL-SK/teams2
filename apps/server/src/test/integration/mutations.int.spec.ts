import { startTestServer, TestServer } from '../test-server';
import * as G from '../client-documents';
import { sendEmail } from '../../app/utils/mailer';
import { noteRepository, registrationRepository, teamRepository } from '../../app/models';

describe('GraphQL mutácie (admin)', () => {
  let srv: TestServer;
  let token: string;

  beforeAll(async () => {
    srv = await startTestServer();
    token = await srv.loginAs(srv.data.users.admin.username, srv.data.users.admin.password);
  });
  afterAll(async () => {
    await srv?.stop();
  });

  const mutate = async <T>(doc: Parameters<TestServer['gql']>[0], vars = {}) => {
    const res = await srv.gql<T>(doc, vars, token);
    expect(res.errors).toBeUndefined();
    return res.data as T;
  };

  describe('vracajú už zmenený dokument (returnDocument: after)', () => {
    it('updateTag', async () => {
      const d = await mutate<G.UpdateTagMutation>(G.UpdateTagDocument, {
        id: srv.data.tags.school,
        input: { label: 'Základná škola' },
      });
      expect(d.updateTag.label).toBe('Základná škola');
    });

    it('updateTeam', async () => {
      const d = await mutate<G.UpdateTeamMutation>(G.UpdateTeamDocument, {
        id: srv.data.teams.Team3,
        input: { name: 'Team3 nový názov' },
      });
      expect(d.updateTeam.team?.name).toBe('Team3 nový názov');
      expect((await teamRepository.findById(srv.data.teams.Team3).exec())?.name).toBe(
        'Team3 nový názov',
      );
    });

    it('updateEvent', async () => {
      const d = await mutate<G.UpdateEventMutation>(G.UpdateEventDocument, {
        id: srv.data.events.Event3,
        input: { name: 'Event3 – finále' },
      });
      expect(d.updateEvent.event?.name).toBe('Event3 – finále');
    });

    it('toggleEventFoodOrderEnabled', async () => {
      const d = await mutate<G.ToggleEventFoodOrderEnabledMutation>(
        G.ToggleEventFoodOrderEnabledDocument,
        { eventId: srv.data.events.Event1, enable: true },
      );
      expect(d.toggleEventFoodOrderEnabled.foodOrderEnabled).toBe(true);
    });
  });

  describe('soft delete a obnovenie', () => {
    it('deleteTeam / undeleteTeam', async () => {
      const id = srv.data.teams.Team2;
      const del = await mutate<G.DeleteTeamMutation>(G.DeleteTeamDocument, { id });
      expect(del.deleteTeam.deletedOn).toBeTruthy();

      const active = await mutate<G.GetTeamsQuery>(G.GetTeamsDocument, { filter: {} });
      expect(active.getTeams.map((t) => t.id)).not.toContain(id);

      const undel = await mutate<G.UndeleteTeamMutation>(G.UndeleteTeamDocument, { id });
      expect(undel.undeleteTeam.deletedOn).toBeNull();
    });

    it('deleteTag / restoreTag', async () => {
      const id = srv.data.tags.new;
      const del = await mutate<G.DeleteTagMutation>(G.DeleteTagDocument, { id });
      expect(del.deleteTag.deletedOn).toBeTruthy();
      const tags = await mutate<G.GetTagsQuery>(G.GetTagsDocument, {});
      expect(tags.getTags.map((t) => t.id)).not.toContain(id);

      const restored = await mutate<G.RestoreTagMutation>(G.RestoreTagDocument, { id });
      expect(restored.restoreTag.deletedOn).toBeNull();
    });
  });

  describe('registrácie', () => {
    it('potvrdenie a zrušenie potvrdenia registrácie, potvrdenie pošle e-mail', async () => {
      const id = srv.data.programRegistrations.Team2;
      vi.mocked(sendEmail).mockClear();

      const set = await mutate<G.RegistrationSetConfirmedMutation>(
        G.RegistrationSetConfirmedDocument,
        { id, date: new Date().toISOString() },
      );
      expect(set.registrationSetConfirmed.confirmedOn).toBeTruthy();
      await vi.waitFor(() => expect(sendEmail).toHaveBeenCalled());

      const clear = await mutate<G.RegistrationClearConfirmedMutation>(
        G.RegistrationClearConfirmedDocument,
        { id },
      );
      expect(clear.registrationClearConfirmed.confirmedOn).toBeNull();
      expect((await registrationRepository.findById(id).exec())?.confirmedOn).toBeFalsy();
    });

    // Team1 má fakturačnú adresu (Team3 nie – registrácia ju preberá z tímu)
    it('registrácia tímu do programu skopíruje fakturačné položky programu', async () => {
      const d = await mutate<G.CreateProgramRegistrationMutation>(
        G.CreateProgramRegistrationDocument,
        {
          programId: srv.data.programs.Program2,
          teamId: srv.data.teams.Team1,
          input: {
            type: 'CLASS_PACK',
            setCount: 2,
            impactedTeamCount: 2,
            impactedChildrenCount: 20,
          },
        },
      );
      expect(d.createProgramRegistration.errors ?? []).toEqual([]);
      const regId = d.createProgramRegistration.registration!.id;
      const reg = await mutate<G.GetRegistrationQuery>(G.GetRegistrationDocument, { id: regId });
      expect(reg.getRegistration).toMatchObject({ type: 'CLASS_PACK', setCount: 2 });
      expect(reg.getRegistration?.invoiceItems.map((i) => i.text)).toEqual(['Item21']);
    });
  });

  // kontrola duplicity počíta iba potvrdené registrácie – opraviť v #287
  it.todo('opakovaná registrácia toho istého tímu do programu sa odmietne (#287)');

  describe('poznámky', () => {
    it('createNote / updateNote vrátia poznámku s autorom', async () => {
      const { teams, users } = srv.data;
      const created = await mutate<G.CreateNoteMutation>(G.CreateNoteDocument, {
        input: { type: 'team', ref: teams.Team3, text: 'Prvá poznámka' },
      });
      const note = created.createNote;
      expect(note).toMatchObject({ text: 'Prvá poznámka', creator: { id: users.admin.id } });

      const updated = await mutate<G.UpdateNoteMutation>(G.UpdateNoteDocument, {
        id: note.id,
        input: { text: 'Upravená poznámka' },
      });
      expect(updated.updateNote.text).toBe('Upravená poznámka');
      expect((await noteRepository.findById(note.id).exec())?.text).toBe('Upravená poznámka');
    });
  });
});
