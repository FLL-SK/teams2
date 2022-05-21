import * as mongoose from 'mongoose';
import { getServerConfig } from '../../server-config';
import { logger } from '@teams2/logger';
import { preSeed } from './preseed';
import { upgrade } from './upgrade';

export * from './seed';

const log = logger('btsMongo');

export async function bootstrapMongoDB(): Promise<void> {
  try {
    await mongoose.connect(getServerConfig().mongoDBUri);
    log.info('Connected successfully to MongoDB server');
    await preSeed();
    await upgrade();
  } catch (error) {
    log.fatal(
      `Error while connecting to MongoDB, url=${getServerConfig().mongoDBUri} error=%o`,
      error
    );
    process.exit(1);
  }
}
