# FIRST LEGO League team management system

- manage team data
- manage programs, events/tournaments
- manage registrations, billing

## Development

Requirements: Node.js 26 LTS (see `.nvmrc`), pnpm 12 (`npm i -g pnpm@12`).

```bash
pnpm install
pnpm generate      # GraphQL schema + types
pnpm start:dev     # server :5000 + client :4200
pnpm test          # unit tests (Vitest)
pnpm e2e           # E2E tests (Playwright)
pnpm build:all     # production build to dist/
```

See [AGENTS.md](AGENTS.md) for details.
