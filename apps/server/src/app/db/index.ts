import * as mongoose from 'mongoose';
import { getServerConfig } from '../../server-config';
import { logger } from '@teams2/logger';
import { preSeed } from './preseed';
import { upgrade } from './upgrade';

export * from './test-seed';

const log = logger('btsMongo');

/**
 * Pripojí sa k MongoDB a pripraví DB (preseed + idempotentné migrácie dát).
 * Pri chybe vyhodí výnimku – používajú to aj integračné testy.
 */
export async function connectMongoDB(uri: string): Promise<void> {
  await mongoose.connect(uri);
  mongoose.set('updatePipeline', true);
  log.info('Connected successfully to MongoDB server');
  await preSeed();
  await upgrade();
}

/** Štart servera – pri chybe pripojenia proces ukončí. */
export async function bootstrapMongoDB(): Promise<void> {
  try {
    await connectMongoDB(getServerConfig().mongoDBUri);
  } catch (error) {
    log.fatal(`Error while connecting to MongoDB error=%o`, error);
    log.debug('Mongo URI: %s', getServerConfig().mongoDBUri);
    process.exit(1);
  }
}
