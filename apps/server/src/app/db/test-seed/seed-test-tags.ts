import { TagData, tagRepository, teamRepository } from '../../models';
import { logger } from '@teams2/logger';

type TestSeedData = TagData & { teams: string[] };

export const seedTestTagsData: TestSeedData[] = [
  { label: 'Nový tím', color: 'TC1', teams: ['Team1'] },
  { label: 'Škola', color: 'TC2', teams: ['Team1', 'Team2'] },
  { label: 'Zrušený tag', color: 'TC3', deletedOn: new Date(), teams: [] },
];

const log = logger('testseed:Tags');

export async function seedTestTags() {
  for (const d of seedTestTagsData) {
    const { teams, ...data } = d;
    const tag = await tagRepository.create(data);
    if (teams.length > 0) {
      await teamRepository.updateMany({ name: { $in: teams } }, { $addToSet: { tagIds: tag._id } });
    }
    log.debug(`Tag created label=%s id=%s`, tag.label, tag._id);
  }
}
