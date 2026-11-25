import mongoose from 'mongoose';
import { inject } from 'vitest';
import { connectMongoDB } from '..';
import {
  eventRepository,
  noteRepository,
  programRepository,
  registrationRepository,
  settingsRepository,
  tagRepository,
  teamRepository,
  userRepository,
} from '../../models';
import { compareHash } from '../../utils/hash-password';
import { seedTestData, SeededTestData } from '.';

describe('test seed', () => {
  let data: SeededTestData;

  beforeAll(async () => {
    const uri = new URL(inject('mongoUri'));
    uri.pathname = `/it_seed_${Date.now()}`;
    await connectMongoDB(uri.toString());
    data = await seedTestData({ generatedTeams: 3 });
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.disconnect();
  });

  it('preseed vytvorí superadmina a nastavenia', async () => {
    const sa = await userRepository.findOne({ username: 'superadmin@example.com' }).exec();
    expect(sa?.isSuperAdmin).toBe(true);
    expect(await settingsRepository.get()).toBeTruthy();
  });

  it('vytvorí očakávané počty záznamov', async () => {
    expect(await userRepository.countDocuments()).toBe(9); // 8 zo seedu + superadmin
    expect(await teamRepository.countDocuments()).toBe(6); // Team1-3 + 3 vygenerované
    expect(await programRepository.countDocuments()).toBe(3);
    expect(await eventRepository.countDocuments()).toBe(3);
    expect(await tagRepository.countDocuments()).toBe(3);
    expect(await noteRepository.countDocuments()).toBe(5);
    expect(await registrationRepository.countDocuments({ eventId: null })).toBe(2);
    expect(await registrationRepository.countDocuments({ eventId: { $ne: null } })).toBe(4);
  });

  it('vráti ID a prihlasovacie údaje použiteľné v testoch', async () => {
    const admin = await userRepository.findById(data.users.admin.id).exec();
    expect(admin?.isAdmin).toBe(true);
    expect(await compareHash(data.users.admin.password, admin!.password)).toBe(true);

    const team1 = await teamRepository.findById(data.teams.Team1).exec();
    expect(team1?.coachesIds.map(String)).toEqual([data.users.coach1.id]);
    expect(team1?.tagIds.map(String).sort()).toEqual([data.tags.new, data.tags.school].sort());

    const event1 = await eventRepository.findById(data.events.Event1).exec();
    expect(event1?.managersIds.map(String)).toContain(data.users.eventmgr1.id);
    expect(event1?.programId.toString()).toBe(data.programs.Program1);

    expect(Object.keys(data.eventRegistrations).sort()).toEqual([
      'Event1/Team1',
      'Event2/Team2',
      'Event2/Team3',
      'Event3/Team3',
    ]);
    const reg = await registrationRepository.findById(data.programRegistrations.Team1).exec();
    expect(reg?.teamNo).toBe('001');
    expect(reg?.confirmedOn).toBeTruthy();
  });
});
