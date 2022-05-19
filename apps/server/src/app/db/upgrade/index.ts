import debugLib from 'debug';

export async function upgrade() {
  const debug = debugLib('upgrade');
  debug('DB Upgrade');
}
