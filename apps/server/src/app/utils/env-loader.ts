import { config as dotEnvConfig, listDotenvFiles } from 'dotenv-flow';
import * as path from 'path';
import { cwd } from 'process';

export function loadDotEnvFiles() {
  // https://stackoverflow.com/questions/58090082/process-env-node-env-always-development-when-building-nestjs-app-with-nrwl-nx
  const nodeEnv = process.env['NODE' + '_ENV'] || 'development';

  // eslint-disable-next-line no-console
  console.log(listDotenvFiles('.', { node_env: nodeEnv }), cwd());
  //1. load project specific env variables
  dotEnvConfig({
    node_env: nodeEnv,
    silent: false,
    purge_dotenv: true,
    path: path.join(cwd(), 'apps/server'),
  });

  // 2. load workspace env variables
  dotEnvConfig({
    node_env: nodeEnv,
    silent: false,
    purge_dotenv: true,
    path: path.join(cwd()),
  });
}
