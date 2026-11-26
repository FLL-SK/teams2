import debugLib from 'debug';
import { DEFAULT_LOG_NAMESPACES, enabledNamespaces, logger } from './logger';

describe('logger', () => {
  it('vráti funkcie pre všetky úrovne', () => {
    const log = logger('test');
    for (const level of ['debug', 'info', 'warn', 'error', 'fatal'] as const) {
      expect(typeof log[level]).toBe('function');
    }
    expect(log.extend('sub').debug.namespace).toBe('test:sub');
  });

  it('info/warning/error sú zapnuté vždy, debug iba podľa DEBUG', () => {
    expect(debugLib.enabled('info:x')).toBe(true);
    expect(debugLib.enabled('error:x')).toBe(true);
    expect(debugLib.enabled('warning:x')).toBe(true);
  });
});

describe('enabledNamespaces (#293)', () => {
  it('bez DEBUG – iba predvolené úrovne', () => {
    expect(enabledNamespaces(undefined)).toBe(DEFAULT_LOG_NAMESPACES.join(','));
    expect(enabledNamespaces('')).toBe(DEFAULT_LOG_NAMESPACES.join(','));
  });

  it('menné priestory z DEBUG sa pridajú k predvoleným (nie sú prepísané)', () => {
    expect(enabledNamespaces('DS:*')).toBe('DS:*,info:*,error:*,warning:*');
    expect(enabledNamespaces('DS:*, auth:*')).toBe('DS:*,auth:*,info:*,error:*,warning:*');
  });

  it('opakované zavolanie (DEBUG už obsahuje predvolené) nič nezdvojí', () => {
    const once = enabledNamespaces('DS:*');
    expect(enabledNamespaces(once)).toBe(once);
  });

  it('s DEBUG=DS:* sa debug logy datasources zapnú', () => {
    debugLib.enable(enabledNamespaces('DS:*'));
    try {
      expect(debugLib.enabled('DS:User')).toBe(true);
      expect(debugLib.enabled('info:x')).toBe(true);
      expect(debugLib.enabled('iny:modul')).toBe(false);
    } finally {
      debugLib.enable(enabledNamespaces(undefined));
    }
  });
});
