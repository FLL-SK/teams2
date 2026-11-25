import type { TestProject } from 'vitest/node';
import { MongoMemoryServer } from 'mongodb-memory-server-core';

/** verzia MongoDB ako v produkcii */
export const MONGODB_VERSION = '8.0.16';

let mongod: MongoMemoryServer | undefined;

export async function setup(project: TestProject) {
  mongod = await MongoMemoryServer.create({ binary: { version: MONGODB_VERSION } });
  project.provide('mongoUri', mongod.getUri());
}

export async function teardown() {
  await mongod?.stop();
}
