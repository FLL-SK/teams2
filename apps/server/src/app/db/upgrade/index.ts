import debugLib from 'debug';
import { teamRepository } from '../../models';

export async function upgrade() {
  const debug = debugLib('upgrade');
  debug('DB Upgrade');
  await addTagFieldToTeam();
}

async function addTagFieldToTeam() {
  const debug = debugLib('upgrade:addTagFieldToTeam');
  debug('addTagFieldToTeam');
  const t = await teamRepository.updateMany({ teamIds: null }, { $set: { teamIds: [] } }).exec();
  debug('updated %o', t);
}
