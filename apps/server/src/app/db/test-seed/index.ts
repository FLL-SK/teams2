import { logger } from '@teams2/logger';
import { getServerConfig } from '../../../server-config';
import {
  eventRepository,
  fileRepository,
  invoiceItemRepository,
  noteRepository,
  programRepository,
  registrationRepository,
  tagRepository,
  teamRepository,
  userRepository,
} from '../../models';
import { seedTestEvents } from './seed-test-events';
import { seedTestPrograms } from './seed-test-programs';
import { seedTestProgramRegistrations, seedTestRegistrations } from './seed-test-registrations';
import { seedTestTags } from './seed-test-tags';
import { seedTestTeams } from './seed-test-teams';
import { seedTestUsers, seedTestUsersData } from './seed-test-users';

const log = logger('testseed');

/** používateľ zo seedu s heslom na prihlásenie */
export interface SeededUser {
  id: string;
  username: string;
  password: string;
}

/** ID a prihlasovacie údaje vytvorené test seedom (pre testy) */
export interface SeededTestData {
  users: {
    admin: SeededUser;
    coach1: SeededUser;
    coach2: SeededUser;
    coach3: SeededUser;
    eventmgr1: SeededUser;
    eventmgr2: SeededUser;
    progmgr1: SeededUser;
    progmgr2: SeededUser;
  };
  teams: Record<'Team1' | 'Team2' | 'Team3', string>;
  programs: Record<'Program1' | 'Program2' | 'Program3', string>;
  events: Record<'Event1' | 'Event2' | 'Event3', string>;
  tags: Record<'new' | 'school' | 'deleted', string>;
  /** registrácie do programu (bez turnaja) podľa názvu tímu */
  programRegistrations: Record<'Team1' | 'Team2', string>;
  /** registrácie na turnaj, kľúč `<turnaj>/<tím>` */
  eventRegistrations: Record<string, string>;
}

export interface SeedTestDataOptions {
  /** počet ďalších vygenerovaných tímov (Team100, …) */
  generatedTeams?: number;
}

/** Naplní (prázdnu) DB testovacími dátami a vráti ich ID. */
export async function seedTestData(options: SeedTestDataOptions = {}): Promise<SeededTestData> {
  log.debug('Seeding users:');
  await seedTestUsers();
  log.debug('Seeding teams:');
  await seedTestTeams(options.generatedTeams ?? 0);
  log.debug('Seeding tags:');
  await seedTestTags();
  log.debug('Seeding programs:');
  await seedTestPrograms();
  log.debug('Seeding events:');
  await seedTestEvents();
  log.debug('Seeding registrations:');
  await seedTestProgramRegistrations();
  await seedTestRegistrations();
  return collectSeededTestData();
}

async function collectSeededTestData(): Promise<SeededTestData> {
  const user = async (key: string) => {
    const username = `devtest+${key}@fll.sk`;
    const u = await userRepository.findOne({ username }).exec();
    const password = seedTestUsersData.find((d) => d.username === username)?.password;
    if (!u || !password) throw new Error(`Seeded user ${username} not found`);
    return { id: u._id.toString(), username, password };
  };
  const byName = async <K extends string>(
    repo: typeof teamRepository | typeof programRepository | typeof eventRepository,
    names: K[],
  ) => {
    const out = {} as Record<K, string>;
    for (const name of names) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const doc = await (repo as any).findOne({ name }).exec();
      if (!doc) throw new Error(`Seeded ${name} not found`);
      out[name] = doc._id.toString();
    }
    return out;
  };

  const teams = await byName(teamRepository, ['Team1', 'Team2', 'Team3']);
  const programs = {
    ...(await byName(programRepository, ['Program1', 'Program2'])),
    Program3: '',
  };
  const events = await byName(eventRepository, ['Event1', 'Event2', 'Event3']);
  // Program3 má v názve "-not active"
  const program3 = await programRepository.findOne({ name: /^Program3/ }).exec();
  programs.Program3 = program3!._id.toString();

  const tagId = async (label: string) =>
    (await tagRepository.findOne({ label }).exec())!._id.toString();

  const programRegistrations = {} as SeededTestData['programRegistrations'];
  for (const team of ['Team1', 'Team2'] as const) {
    const r = await registrationRepository
      .findOne({ teamId: teams[team], programId: programs.Program1, eventId: null })
      .exec();
    programRegistrations[team] = r!._id.toString();
  }

  const eventRegistrations: Record<string, string> = {};
  for (const r of await registrationRepository.find({ eventId: { $ne: null } }).exec()) {
    const event = Object.entries(events).find(([, id]) => id === r.eventId.toString())?.[0];
    const team = Object.entries(teams).find(([, id]) => id === r.teamId.toString())?.[0];
    eventRegistrations[`${event}/${team}`] = r._id.toString();
  }

  return {
    users: {
      admin: await user('admin'),
      coach1: await user('coach1'),
      coach2: await user('coach2'),
      coach3: await user('coach3'),
      eventmgr1: await user('eventmgr1'),
      eventmgr2: await user('eventmgr2'),
      progmgr1: await user('progmgr1'),
      progmgr2: await user('progmgr2'),
    },
    teams,
    programs,
    events,
    tags: {
      new: await tagId('Nový tím'),
      school: await tagId('Škola'),
      deleted: await tagId('Zrušený tag'),
    },
    programRegistrations,
    eventRegistrations,
  };
}

/** `pnpm testseed` – vyčistí DB (iba v režime development) a naplní ju testovacími dátami. */
export async function testDbSeed() {
  // rovnako ako server-config: nenastavené NODE_ENV = development
  const nodeEnv = getServerConfig().nodeEnv;
  if (nodeEnv !== 'development') {
    log.warn('testseed runs only with NODE_ENV=development (current: %s)', nodeEnv);
    return;
  }
  log.debug('cleaning repos NODE_ENV=%s', nodeEnv);
  await noteRepository.clean();
  await tagRepository.clean();
  await eventRepository.clean();
  await programRepository.clean();
  await teamRepository.clean();
  await userRepository.clean();
  await invoiceItemRepository.clean();
  await registrationRepository.clean();
  await fileRepository.clean();

  await seedTestData({ generatedTeams: 401 });
}
