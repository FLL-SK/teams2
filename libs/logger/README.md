# @teams2/logger

Logovanie nad knižnicou `debug`: `logger(modul)` s úrovňami debug/info/warn/error. Info, warning a error sa logujú vždy, debug podľa premennej `DEBUG` (napr. `DEBUG=DS:*`).

Import cez alias `@teams2/logger` (`tsconfig.base.json`).

## Testy

```bash
pnpm test --project logger
```
