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

/** úrovne, ktoré sa logujú vždy */
export const DEFAULT_LOG_NAMESPACES = ['info:*', 'error:*', 'warning:*'];

/**
 * Menné priestory pre `debug`: vždy info/warning/error a k nim tie z premennej `DEBUG`
 * (napr. `DEBUG=DS:*` zapne debug logy datasources). Predtým `enable()` premennú `DEBUG`
 * prepísal a debug logy sa nedali zapnúť (#293).
 */
export function enabledNamespaces(envDebug: string | undefined): string {
  const fromEnv = (envDebug ?? '')
    .split(/[\s,]+/)
    .filter((ns) => ns && !DEFAULT_LOG_NAMESPACES.includes(ns));
  return [...fromEnv, ...DEFAULT_LOG_NAMESPACES].join(',');
}

debugLib.enable(enabledNamespaces(process.env.DEBUG));
