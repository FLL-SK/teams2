# AGENTS.md – inštrukcie pre AI agentov

Tento súbor je jediný zdroj inštrukcií pre všetkých AI agentov (Claude Code, Copilot, Cursor, Codex, …), ktorí pracujú s týmto repozitárom. Súbory pre konkrétnych agentov (napr. `CLAUDE.md`) majú obsahovať iba odkaz sem.

## Pravidlá spolupráce (povinné)

### Jazyk

- S používateľom komunikuj **vždy po slovensky**.
- **Commit správy, názvy a popisy PR, issues a komentáre v GitHube píš po slovensky.**
- Identifikátory v kóde (premenné, funkcie, typy, GraphQL schéma) zostávajú po anglicky, ako je v repozitári zvykom. Texty v UI sú po slovensky.

### Postup pri zmenách v kóde

1. **Vetva** – skôr než začneš meniť kód, opýtaj sa používateľa, kde má zmena vzniknúť:
   - v aktuálnej vetve,
   - v novej vetve vytvorenej z aktuálnej vetvy,
   - v novej vetve vytvorenej z `main`.
2. **Issue** – ku každej zmene vytvor issue v GitHube (`gh issue create`, repozitár `FLL-SK/teams2`), pokiaľ už neexistuje. Na issue sa odkazuj v commitoch (napr. `… #123`) a v PR (`Closes #123`).
3. **Plán** – keď začneš zmenu riešiť, najprv priprav plán implementácie (ktoré súbory, aké zmeny, aké testy) a **opýtaj sa používateľa, či môžeš implementovať podľa navrhnutého plánu**. Bez súhlasu neimplementuj.
   - Keď používateľ plán odsúhlasí, **zapíš ho do issue** – do popisu issue (`gh issue edit <číslo> --body-file …`, pôvodný text zachovaj) ako sekciu `## Plán implementácie` s tasklistom (`- [ ] …`), prípadne aj s krátkym popisom príčiny/riešenia.
   - Počas implementácie **priebežne aktualizuj issue**: po dokončení položky ju v taskliste odfajkni (`- [x] …`) a pri významnejších krokoch (napr. zmena plánu, výsledky testov, vytvorený PR) pridaj komentár so stavom plnenia (`gh issue comment`).
4. **Testy** – ku každej zmene napíš alebo uprav testy (pozri sekciu [Testy](#testy)).
5. **Overenie** – pred commitom spusti testy, lint a build dotknutých projektov a výsledok poctivo uveď.
6. **Commit a PR** – máš oprávnenie commitovať, pushovať, vytvárať issues a PR v GitHube. Do `main` priamo nepushuj; zmeny idú cez PR. PR nemerguj bez výslovného pokynu používateľa.

### Bezpečnosť

- Necommituj `.env` ani iné súbory s tajomstvami (JWT secret, AWS kľúče, SuperFaktúra API kľúče, MongoDB URI).
- Push do `main` spúšťa build a **nasadenie do produkcie** (pozri [CI/CD](#cicd-a-nasadenie)) – s `main` zaobchádzaj opatrne.

## O projekte

**FLL TMS (teams2)** – systém na správu tímov FIRST LEGO League na Slovensku (FLL-SK):

- správa tímov, trénerov (coach) a používateľov,
- správa programov (sezón) a podujatí/turnajov (events),
- registrácie tímov do programov a na podujatia (typy registrácie `NORMAL`, `CLASS_PACK`), objednávky (materiál, jedlo na podujatí),
- fakturácia cez SuperFaktúru, platobný callback, odosielanie e-mailov (AWS SES), súbory na AWS S3,
- tagy, poznámky, exporty do CSV/XLSX.

Repozitár: <https://github.com/FLL-SK/teams2>, hlavná vetva `main`.

## Technológie

- **Monorepo bez build systému** – jeden spoločný `package.json`, balíčkovač **pnpm 12** (`pnpm-workspace.yaml` obsahuje iba nastavenia, napr. `allowBuilds`), **Node.js 26 LTS** (`.nvmrc`), **TypeScript 6.0**.
  - Node 26 už neobsahuje corepack – pnpm nainštaluj cez `npm i -g pnpm@<verzia z packageManager>` (alebo `fnm`/`volta`).
- **Server** (`apps/server`): Express 5, Apollo Server 5 (GraphQL, `graphql` 16), Mongoose 9 / MongoDB driver 7 (produkcia: MongoDB 8.0), Passport (JWT + local), DataLoader, AWS SDK (S3, SES). Build cez esbuild (`scripts/build-server.mjs`), vývoj cez `tsx watch`.
- **Klient** (`apps/client`): React 19, Vite 8, Grommet (UI komponenty), styled-components 6, Apollo Client 4, React Router 8 (balík `react-router`), react-virtualized 10 + react-virtualized-auto-sizer, react-colorful, markdown-to-jsx, xlsx.
- **Knižnice** (`libs/*`, aliasy v `tsconfig.base.json`):
  - `@teams2/auth-node` – autentifikácia na serveri (passport, JWT, auth router),
  - `@teams2/auth-react` – autentifikácia na klientovi (provider, `RequireAuth`, Apollo provider s tokenom),
  - `@teams2/common` – zdieľané typy a chybové kódy,
  - `@teams2/dateutils` – práca s dátumami (date-fns),
  - `@teams2/logger` – logovanie (nad knižnicou `debug`).
- **Testy**: Vitest 5 (jednotkové a komponentové testy), Playwright (E2E, `apps/client-e2e`).
- **Lint**: ESLint 9 (flat config `eslint.config.mjs` v koreni, typescript-eslint, eslint-plugin-react, react-hooks). ESLint 10 zatiaľ nie – `eslint-plugin-react` ho nepodporuje.

## Štruktúra repozitára

```
contract/                 GraphQL schéma (zdroj pravdy API), schema.graphql importuje ostatné
scripts/build-schema.ts   zlúči contract/*.graphql do dist/schema.graphql
scripts/build-server.mjs  build servera (esbuild) do dist/apps/server
scripts/typecheck.mjs     typová kontrola všetkých tsconfig.{app,lib,spec}.json
codegen.ts                GraphQL codegen -> typy pre server aj klienta
vitest.config.mts         zoznam Vitest projektov (apps/server, apps/client, libs/*, scripts)
eslint.config.mjs         ESLint konfigurácia pre celý repozitár
apps/server/src/
  main.ts                 štart servera (a príkaz `testseed`)
  server-config.ts        konfigurácia z premenných prostredia
  app/apollo/
    resolvers/            GraphQL resolvery (tenké, volajú datasources)
    datasources/          biznis logika + autorizácia (UserGuard), DataLoadery
    mappers/              mapovanie Mongoose dokumentov -> GraphQL typy
    scalars/              vlastné skaláry (DateTime, ID, …)
  app/models/             Mongoose modely (*Repository)
  app/domains/            doménová logika (registrácie, podujatia, fakturácia SuperFaktúra)
  app/db/                 pripojenie k DB, preseed, test-seed, upgrade (migrácie dát pri štarte)
  app/routes/             REST routy (auth, payment callback)
  app/utils/              user-guard, e-maily, mailer, S3, nastavenia, …
apps/client/
  graphql/                GraphQL operácie a fragmenty klienta (*.graphql)
  src/app/pages/          stránky (každá s podadresárom components/)
  src/app/components/     zdieľané komponenty, dialógy, editory, zoznamy
  src/app/utils/          formátovanie, exporty (CSV/XLSX), upload na S3
  src/app/theme/          téma Grommet a farby
  public/assets/variables.js  runtime konfigurácia (APP_API_URL, APP_SF_API_URL)
libs/                     zdieľané knižnice (pozri vyššie)
tools/docker-web-server/  nginx konfigurácia a štartovacie skripty klientského kontajnera
```

## Generovaný kód

- Súbory `apps/server/src/app/_generated/graphql.ts`, `apps/client/src/app/_generated/graphql.tsx`, `apps/client/src/app/_generated/schema.ts`, `dist/schema.graphql` a `graphql.schema.json` sú **generované a necommitujú sa** (`.gitignore`).
- Klient: `schema.ts` obsahuje typy celej schémy (plugin `typescript`), `graphql.tsx` typy operácií a dokumenty (`typescript-operations` + `typescript-react-apollo`) a preexportuje `schema.ts` – importuj vždy z `_generated/graphql`.
- Po čerstvom klone a **po každej zmene v `contract/` alebo v `apps/client/graphql/`** spusti:
  ```bash
  pnpm generate
  ```
  (= `gql:schema` + `gql:codegen`). Bez toho nepôjde build, testy ani typová kontrola.
- Generované súbory nikdy neupravuj ručne.

## Bežné príkazy

```bash
pnpm install            # inštalácia závislostí
pnpm generate           # vygenerovanie GraphQL schémy a typov
pnpm start:dev          # vývojový server (tsx watch, :5000) + klient (vite, :4200)
pnpm dev:server         # iba server / pnpm dev:client – iba klient
pnpm build:all          # generate + build servera aj klienta do dist/
pnpm test               # testy všetkých projektov (vitest run)
pnpm test --project server   # testy jedného projektu (server|client|common|dateutils|logger|auth-node|auth-react|scripts)
pnpm test:integration   # integračné testy servera (MongoDB v pamäti)
pnpm e2e                # E2E testy (Playwright, API je mockované)
pnpm lint               # lint celého repozitára (eslint .) – bez chýb aj bez varovaní
pnpm format:check       # kontrola formátovania (Prettier), `pnpm format` opraví
pnpm typecheck          # typová kontrola všetkých projektov (napr. `pnpm typecheck client`)
pnpm testseed           # vyčistenie a naplnenie DB testovacími dátami (iba NODE_ENV=development)
```

Formátovanie: Prettier (`singleQuote`, `printWidth: 100`), 2 medzery, UTF-8, prázdny riadok na konci súboru (`.editorconfig`). Lint: ESLint 9 (jeden `eslint.config.mjs` v koreni). Lint aj formátovanie kontroluje CI pri PR (`pr-check.yaml`) – pred commitom spusti `pnpm lint` a `pnpm format:check`. Zámerne nepoužité parametre a premenné pomenuj s prefixom `_` (napr. `(_parent, args)`).

## Lokálny vývoj a konfigurácia

- Server číta premenné z `.env` v koreni (dotenv). Predvolené hodnoty sú v `apps/server/src/server-config.ts` (napr. `APP_MONGODB=mongodb://localhost/teams2`, port `5000`, `APP_CLIENT_ROOT_URL=http://localhost:4200`).
- Dôležité premenné: `APP_JWT_SECRET`, `APP_MONGODB`, `APP_CLIENT_ROOT_URL` (môže byť zoznam oddelený čiarkou – CORS), `APP_EMAIL_FROM`, `AWS_*` (S3/SES), `SF_*` (SuperFaktúra), `SUPERADMIN_USERNAME`, `TEAMS_ADMIN_EMAIL`, `DEBUG`, `NODE_ENV`. Úplný zoznam pre produkciu je v `docker-compose.yaml`.
- Logovanie sa zapína cez `DEBUG` (napr. `DEBUG=*` alebo `DEBUG=DS:*`).
- Pri štarte servera sa spúšťa `db/preseed` (superadmin z `SUPERADMIN_USERNAME` – ak chýba, preskočí sa –, nastavenia) a `db/upgrade` – migrácie dát píš ako idempotentné funkcie do `apps/server/src/app/db/upgrade/index.ts`.

## Konvencie a vzory v kóde

### Pridanie / zmena funkcionality v API (typický postup)

1. Uprav GraphQL schému v `contract/<doména>.graphql` (používa `extend type Query/Mutation`).
2. `pnpm generate`.
3. Mongoose model v `apps/server/src/app/models/` (ak treba nové polia).
4. Mapper v `apps/server/src/app/apollo/mappers/`.
5. Logika a **autorizácia** v datasource `apps/server/src/app/apollo/datasources/<doména>.datasource.ts`; zložitejšia doménová logika v `apps/server/src/app/domains/`.
6. Resolver v `apps/server/src/app/apollo/resolvers/` – iba deleguje na `dataSources.<doména>`.
7. Klient: operácia v `apps/client/graphql/<doména>/*.graphql` (+ fragment v `_fragments/`), `pnpm generate`, použitie cez `useQuery`/`useMutation` z `@apollo/client/react` s vygenerovanými `…Document` a typmi `…Query`/`…Mutation`/`…Variables`. Routing cez `react-router` (nie `react-router-dom`).

### Autorizácia

- Kontroly oprávnení sú v datasources cez `this.userGuard` (`apps/server/src/app/utils/user-guard.ts`): `isSuperAdmin`, `isAdmin`, `isCoach(teamId)`, `isEventManager(eventId)`, `isProgramManager(programId)`, `isSelf(userId)` atď.
- Vzor: `await this.userGuard.require('Popis akcie', this.userGuard.isAdmin(), () => this.userGuard.isCoach(teamId));` – kontroly sa vyhodnocujú postupne a lenivo, stačí jedna pravdivá; inak sa vyhodí `notAuthorized`. Asynchrónnu kontrolu odovzdaj ako funkciu (`() => guard.isCoach(id)`), nie ako `Promise` – typová kontrola to vynúti (#279, #297).
- Výrazy bez príkazu (`a || guard.notAuthorized()`, `cb && cb()`) lint nepovoľuje – použi `require`, `if` alebo `cb?.()`.
- `/graphql` je dostupné iba s platným JWT; nová funkcionalita musí vždy explicitne overiť oprávnenia.

### Ďalšie zvyklosti

- Mazanie je spravidla „soft delete“ (`deletedOn`, `deletedBy`) s možnosťou obnovenia (`restore…`).
- ID v serveri sú `ObjectId` (codegen mapuje GraphQL `ID` na `mongodb#ObjectId`), na klientovi `string`.
- Logger: `const log = logger('DS:Tag'); log.extend('metoda')`.
- Polia, ktoré nastavuje konštruktor predka (napr. DataLoader v `BaseDataSource._initialize()`), deklaruj ako `declare private loader: …` – inak ich pri `target` ≥ ES2022 (sémantika „define“, Vitest/oxc) prepíše inicializácia poľa podtriedy na `undefined`.
- UI: komponenty Grommet, štýly cez styled-components, notifikácie cez `useNotification`, chyby mutácií cez `utils/handle_mutation_error.ts`.

## Testy

### Jednotkové a komponentové testy – Vitest

- Framework: **Vitest 5** (`globals: true` – `describe`/`it`/`expect`/`vi` netreba importovať). Jest sa v repozitári nepoužíva.
- Konfigurácia: koreňový `vitest.config.mts` vymenúva projekty (`test.projects`), každý projekt má vlastný `vitest.config.mts` (`libs/*`, `apps/server`, `scripts`), klient má sekciu `test` priamo v `apps/client/vite.config.mts`. Aliasy `@teams2/*` sa riešia cez `resolve.tsconfigPaths`.
  - server a `libs/*`: prostredie `node`; `dateutils` beží s `TZ=Europe/Bratislava`,
  - klient a `auth-react`: prostredie `jsdom`, React Testing Library (`@testing-library/react`), Apollo `MockLink` / `MockedProvider`.
- Nový projekt s testami pridaj do `test.projects` v koreňovom `vitest.config.mts`.
- Mockovanie: `vi.mock(...)`, `vi.fn()`. Ťažké podradené komponenty pri teste stránky nahraď jednoduchými stubmi.
- Testy sa umiestňujú vedľa testovaného súboru ako `*.spec.ts` / `*.spec.tsx`.
- **Ku každej zmene pridaj testy**, minimálne:
  - jednotkové testy čistých funkcií (utils, mappers, domains, dateutils, formátovanie, exporty),
  - pri logike v datasources/domains testy s mockovanými repository / `UserGuard` (vrátane kontroly oprávnení),
  - pri komponentoch klienta test renderovania a kľúčového správania,
  - pri oprave chyby regresný test, ktorý na pôvodnom kóde zlyhá.
- Testy nesmú vyžadovať reálnu (bežiacu) MongoDB, AWS ani SuperFaktúru – externé závislosti mockuj. MongoDB v pamäti (integračné testy nižšie) je povolená.
- Spúšťanie: `pnpm test --project <projekt>`, všetko `pnpm test`, watch režim `pnpm test:watch`. Pred testami servera/klienta musí byť spustený `pnpm generate`.

### Integračné testy servera – MongoDB v pamäti

- Testujú celý server: Express + passport/JWT + Apollo + datasources + Mongoose nad skutočnou MongoDB (**8.0.16**, rovnaká ako v produkcii) cez `mongodb-memory-server-core`.
- Súbory `*.int.spec.ts` (`apps/server/src/test/integration/`, prípadne vedľa testovaného kódu), konfigurácia `apps/server/vitest.integration.config.mts`. Bežné `pnpm test` ich nespúšťa.
- Spúšťanie: `pnpm test:integration` (konkrétny súbor: `pnpm test:integration permissions`). Prvé spustenie stiahne binárku `mongod` (~100 MB) do `~/.cache/mongodb-binaries`. Logy servera zapneš cez `DEBUG_TESTS=1`.
- Pomocníci (`apps/server/src/test/`):
  - `startTestServer()` – vlastná databáza pre testovací súbor, test seed, server na náhodnom porte; vracia `data` (ID a prihlasovacie údaje zo seedu), `loginAs()` (skutočný `POST /auth`), `gql()` a `stop()`,
  - `client-documents.ts` – GraphQL dokumenty klienta (`apps/client/graphql`), testy volajú server rovnakými dotazmi ako aplikácia.
- Test seed (`apps/server/src/app/db/test-seed`) – `seedTestData()` vytvorí používateľov (admin, tréneri, správcovia turnajov a programov), tímy, tagy, programy, turnaje, registrácie a poznámky. Pri zmene modelov ho udržuj funkčný (kontroluje ho `test-seed.int.spec.ts`).
- AWS (SES, S3) je mockované v `src/test/setup.ts` (`sendEmail` je `vi.fn()` – dá sa kontrolovať).
- Integračný test pridaj pri zmene autorizácie, resolverov/datasources alebo dotazov do DB. Pri kontrole oprávnení over aj stav v DB, nielen chybovú hlášku.

### E2E testy – Playwright

- Projekt `apps/client-e2e`, konfigurácia `apps/client-e2e/playwright.config.ts`, testy v `apps/client-e2e/src/*.spec.ts`.
- Playwright si sám spustí klienta (`pnpm dev:client`, port 4200), prípadne použije už bežiaci.
- API servera (`http://localhost:5000` – `/auth` aj `/graphql`) sa v testoch **mockuje** cez `mockApi()` z `apps/client-e2e/src/support/mock-api.ts` (odpovede GraphQL podľa názvu operácie, voliteľne prihlásený používateľ). E2E testy teda nepotrebujú server ani MongoDB.
- Pred prvým spustením: `pnpm exec playwright install chromium`.
- Spúšťanie: `pnpm e2e` (konkrétny súbor: `pnpm e2e team-list`); výstupy (report, trace) sú v `dist/.playwright/apps/client-e2e`.
- E2E test pridaj pri zmenách v toku používateľa naprieč stránkami (navigácia, prihlásenie, priame linky) – napr. `registration.spec.ts` pre #269.

## CI/CD a nasadenie

- `.github/workflows/build+deploy.yaml`: pri **pushi do `main`** sa nainštaluje pnpm (`pnpm/action-setup`, verzia z `packageManager`) a Node podľa `.nvmrc`, spustí sa `pnpm install --frozen-lockfile`, `pnpm build:all`, zostavia sa Docker obrazy `fllsk/tms-client` a `fllsk/tms-server` (`Dockerfile.client`, `Dockerfile.server`), pushnú sa na Docker Hub a **nasadia na produkčný server** (`docker-compose.yaml`).
- CI nespúšťa testy ani lint – over ich lokálne pred vytvorením PR.
- Pri zmene závislostí aktualizuj `pnpm-lock.yaml` (CI používa `--frozen-lockfile`).
- Server image (`Dockerfile.server`, `node:26-slim`) inštaluje iba produkčné závislosti (`pnpm install --prod`) – balíky potrebné za behu servera musia byť v `dependencies`, nástroje a klientske knižnice v `devDependencies`.
- Pri zmene verzie Node uprav `.nvmrc`, `engines` v `package.json`, `Dockerfile.server` a `target` v `scripts/build-server.mjs`.

## Konvencie pre Git a GitHub

- Vetvy pomenúvaj krátko a popisne (napr. `fix-registracne-linky-269`, `feature-responzivne-ui`).
- Commit správy po slovensky, stručne, s odkazom na issue: `opravené linky na registráciu #269`.
- PR po slovensky: čo sa mení, prečo, ako bolo otestované, `Closes #<issue>`.
- Issues po slovensky; pri chybe uveď kroky na reprodukciu a očakávané správanie.
