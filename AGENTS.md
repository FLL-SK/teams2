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

- **Monorepo Nx 23**, balíčkovač **Yarn 4** (`.yarn/releases`, `nodeLinker: node-modules`), **Node.js ≥ 22**, TypeScript 5.
- **Server** (`apps/server`): Express 5, Apollo Server 5 (GraphQL), Mongoose 9 / MongoDB, Passport (JWT + local), DataLoader, AWS SDK (S3, SES), build cez esbuild.
- **Klient** (`apps/client`): React 18, Vite, Grommet (UI komponenty), styled-components, Apollo Client 4, React Router 6, markdown-to-jsx, xlsx.
- **Knižnice** (`libs/*`, aliasy v `tsconfig.base.json`):
  - `@teams2/auth-node` – autentifikácia na serveri (passport, JWT, auth router),
  - `@teams2/auth-react` – autentifikácia na klientovi (provider, `RequireAuth`, Apollo provider s tokenom),
  - `@teams2/common` – zdieľané typy a chybové kódy,
  - `@teams2/dateutils` – práca s dátumami (date-fns),
  - `@teams2/logger` – logovanie (nad knižnicou `debug`).
- **Testy**: Vitest (jednotkové a komponentové testy), Playwright (E2E, `apps/client-e2e`).

## Štruktúra repozitára

```
contract/                 GraphQL schéma (zdroj pravdy API), schema.graphql importuje ostatné
scripts/build-schema.ts   zlúči contract/*.graphql do dist/schema.graphql
codegen.ts                GraphQL codegen -> typy pre server aj klienta
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

- Súbory `apps/server/src/app/_generated/graphql.ts`, `apps/client/src/app/_generated/graphql.tsx`, `dist/schema.graphql` a `graphql.schema.json` sú **generované a necommitujú sa** (`.gitignore`).
- Po čerstvom klone a **po každej zmene v `contract/` alebo v `apps/client/graphql/`** spusti:
  ```bash
  yarn generate
  ```
  (= `gql:schema` + `gql:codegen`). Bez toho nepôjde build, testy ani typová kontrola.
- Generované súbory nikdy neupravuj ručne.

## Bežné príkazy

```bash
yarn install            # inštalácia závislostí
yarn generate           # vygenerovanie GraphQL schémy a typov
yarn start:dev          # vývojový server (server :5000) + klient (vite, :4200)
yarn build:all          # generate + build servera aj klienta do dist/
yarn test               # testy všetkých projektov (nx run-many --target=test)
yarn nx test server     # testy jedného projektu (server|client|common|dateutils|logger|auth-node|auth-react)
yarn nx e2e client-e2e   # E2E testy (Playwright, API je mockované)
yarn nx lint client     # lint jedného projektu
yarn nx run client:typecheck   # typová kontrola klienta
yarn testseed           # naplnenie DB testovacími dátami
```

Formátovanie: Prettier (`singleQuote`, `printWidth: 100`), 2 medzery, UTF-8, prázdny riadok na konci súboru (`.editorconfig`). Lint: ESLint 9 (`eslint.config.mjs` + `.eslintrc.json` v projektoch).

## Lokálny vývoj a konfigurácia

- Server číta premenné z `.env` v koreni (dotenv). Predvolené hodnoty sú v `apps/server/src/server-config.ts` (napr. `APP_MONGODB=mongodb://localhost/teams2`, port `5000`, `APP_CLIENT_ROOT_URL=http://localhost:4200`).
- Dôležité premenné: `APP_JWT_SECRET`, `APP_MONGODB`, `APP_CLIENT_ROOT_URL` (môže byť zoznam oddelený čiarkou – CORS), `APP_EMAIL_FROM`, `AWS_*` (S3/SES), `SF_*` (SuperFaktúra), `SUPERADMIN_USERNAME`, `TEAMS_ADMIN_EMAIL`, `DEBUG`, `NODE_ENV`. Úplný zoznam pre produkciu je v `docker-compose.yaml`.
- Logovanie sa zapína cez `DEBUG` (napr. `DEBUG=*` alebo `DEBUG=DS:*`).
- Pri štarte servera sa spúšťa `db/preseed` a `db/upgrade` – migrácie dát píš ako idempotentné funkcie do `apps/server/src/app/db/upgrade/index.ts`.

## Konvencie a vzory v kóde

### Pridanie / zmena funkcionality v API (typický postup)

1. Uprav GraphQL schému v `contract/<doména>.graphql` (používa `extend type Query/Mutation`).
2. `yarn generate`.
3. Mongoose model v `apps/server/src/app/models/` (ak treba nové polia).
4. Mapper v `apps/server/src/app/apollo/mappers/`.
5. Logika a **autorizácia** v datasource `apps/server/src/app/apollo/datasources/<doména>.datasource.ts`; zložitejšia doménová logika v `apps/server/src/app/domains/`.
6. Resolver v `apps/server/src/app/apollo/resolvers/` – iba deleguje na `dataSources.<doména>`.
7. Klient: operácia v `apps/client/graphql/<doména>/*.graphql` (+ fragment v `_fragments/`), `yarn generate`, použitie cez `useQuery`/`useMutation` z `@apollo/client/react` s vygenerovanými `…Document` a typmi `…Query`/`…Mutation`/`…Variables`.

### Autorizácia

- Kontroly oprávnení sú v datasources cez `this.userGuard` (`apps/server/src/app/utils/user-guard.ts`): `isSuperAdmin`, `isAdmin`, `isCoach(teamId)`, `isEventManager(eventId)`, `isProgramManager(programId)`, `isSelf(userId)` atď.
- Vzor: `this.userGuard.isAdmin() || this.userGuard.notAuthorized('Popis akcie');`
- `/graphql` je dostupné iba s platným JWT; nová funkcionalita musí vždy explicitne overiť oprávnenia.

### Ďalšie zvyklosti

- Mazanie je spravidla „soft delete“ (`deletedOn`, `deletedBy`) s možnosťou obnovenia (`restore…`).
- ID v serveri sú `ObjectId` (codegen mapuje GraphQL `ID` na `mongodb#ObjectId`), na klientovi `string`.
- Logger: `const log = logger('DS:Tag'); log.extend('metoda')`.
- UI: komponenty Grommet, štýly cez styled-components, notifikácie cez `useNotification`, chyby mutácií cez `utils/handle_mutation_error.ts`.

## Testy

### Jednotkové a komponentové testy – Vitest

- Framework: **Vitest 4** (`globals: true` – `describe`/`it`/`expect`/`vi` netreba importovať). Jest sa v repozitári nepoužíva.
- Konfigurácia: `vitest.config.mts` v každom projekte (`libs/*`, `apps/server`), klient má sekciu `test` priamo v `apps/client/vite.config.mts`. Aliasy `@teams2/*` sa riešia cez `resolve.tsconfigPaths`.
  - server a `libs/*`: prostredie `node`; `dateutils` beží s `TZ=Europe/Bratislava`,
  - klient a `auth-react`: prostredie `jsdom`, React Testing Library (`@testing-library/react`), Apollo `MockLink` / `MockedProvider`.
- Cieľ `test` sa v Nx odvodzuje automaticky pluginom `@nx/vitest` (`nx.json`, `testMode: run`) – v `project.json` ho nedefinuj.
- Mockovanie: `vi.mock(...)`, `vi.fn()`. Ťažké podradené komponenty pri teste stránky nahraď jednoduchými stubmi.
- Testy sa umiestňujú vedľa testovaného súboru ako `*.spec.ts` / `*.spec.tsx`.
- **Ku každej zmene pridaj testy**, minimálne:
  - jednotkové testy čistých funkcií (utils, mappers, domains, dateutils, formátovanie, exporty),
  - pri logike v datasources/domains testy s mockovanými repository / `UserGuard` (vrátane kontroly oprávnení),
  - pri komponentoch klienta test renderovania a kľúčového správania,
  - pri oprave chyby regresný test, ktorý na pôvodnom kóde zlyhá.
- Testy nesmú vyžadovať reálnu MongoDB, AWS ani SuperFaktúru – externé závislosti mockuj.
- Spúšťanie: `yarn nx test <projekt>`, všetko `yarn test`, watch režim `npx vitest` v adresári projektu. Pred testami servera/klienta musí byť spustený `yarn generate`.

### E2E testy – Playwright

- Projekt `apps/client-e2e`, konfigurácia `apps/client-e2e/playwright.config.ts`, testy v `apps/client-e2e/src/*.spec.ts`. Cieľ `e2e` odvodzuje plugin `@nx/playwright`.
- Playwright si sám spustí klienta (`yarn nx run client:serve`, port 4200), prípadne použije už bežiaci.
- API servera (`http://localhost:5000` – `/auth` aj `/graphql`) sa v testoch **mockuje** cez `mockApi()` z `apps/client-e2e/src/support/mock-api.ts` (odpovede GraphQL podľa názvu operácie, voliteľne prihlásený používateľ). E2E testy teda nepotrebujú server ani MongoDB.
- Pred prvým spustením: `npx playwright install chromium`.
- Spúšťanie: `yarn nx e2e client-e2e`; výstupy (report, trace) sú v `dist/.playwright/apps/client-e2e`.
- E2E test pridaj pri zmenách v toku používateľa naprieč stránkami (navigácia, prihlásenie, priame linky) – napr. `registration.spec.ts` pre #269.

## CI/CD a nasadenie

- `.github/workflows/build+deploy.yaml`: pri **pushi do `main`** sa spustí `yarn install --immutable`, `yarn build:all`, zostavia sa Docker obrazy `fllsk/tms-client` a `fllsk/tms-server` (`Dockerfile.client`, `Dockerfile.server`), pushnú sa na Docker Hub a **nasadia na produkčný server** (`docker-compose.yaml`).
- CI nespúšťa testy ani lint – over ich lokálne pred vytvorením PR.
- Pri zmene závislostí aktualizuj `yarn.lock` (CI používa `--immutable`).

## Konvencie pre Git a GitHub

- Vetvy pomenúvaj krátko a popisne (napr. `fix-registracne-linky-269`, `feature-responzivne-ui`).
- Commit správy po slovensky, stručne, s odkazom na issue: `opravené linky na registráciu #269`.
- PR po slovensky: čo sa mení, prečo, ako bolo otestované, `Closes #<issue>`.
- Issues po slovensky; pri chybe uveď kroky na reprodukciu a očakávané správanie.
