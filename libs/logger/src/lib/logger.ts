import debugLib from 'debug';

export function logger(module: string) {
  return {
    debug: debugLib(module),
    info: debugLib(`info:${module}`),
    error: debugLib(`error:${module}`),
    fatal: debugLib(`error:${module}`),
    warn: debugLib(`warning:${module}`),
    extend: (sub: string) => logger(`${module}:${sub}`),
  };
}

debugLib.enable('info:* error:* warning:*');
