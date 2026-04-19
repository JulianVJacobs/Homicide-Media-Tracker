# Homicide Media Tracker

## Purpose

A data collection and analysis tool for tracking homicide cases from media sources. This project supports both a web-style Next.js development experience and a native desktop distribution via Electron.

This single README combines development guidance from the project and an older backup README. It focuses on practical steps, architecture, and troubleshooting for contributors and maintainers.

## Roadmap

**Current version: 1.1.0 | Strategic direction: AtoM plugin + Event-Actor-Role annotation layer**

### **Foundation: Participant Management (1.x.x releases)**

Establish a solid participant/actor model with alias support, merge workflows, and configurable profiles as the foundation for Event-Actor-Role generalization.

- [x] **1.0.x**
  - [x] Make PWA offline-first
    - [x] Implement service worker for asset caching
    - [x] Use IndexedDB for storage
- [x] **1.1.x**
  - [x] Add "alias" field to every participant
    - [x] Update schema to include alias
    - [x] Add input field to participant form
  - [x] Add participant alias management and promotion
    - [x] Add participant merge management UI
    - [x] Allow promoting an alias to primary name
    - [x] Preserve old primary name as alias after promotion
    - [x] Update duplicate matching to use primary + aliases
- [x] **1.2.x**
  - [x] Combine victim and perpetrator steps into "participants" step
    - [x] Add dropdown to switch between profiles
    - [x] Refactor forms for participant type (type-agnostic form + type selector)
    - [x] Make profiles fully configurable via schema_profile + schema_constraint
- [ ] **1.3.x** (optional polish, defer for Phase 3 if time-critical)
  - [ ] Perpetrator "unknown" input as checkbox
  - [ ] Victim-perpetrator relationship "other" option with custom text
  - [ ] Perpetrator sentencing: support multiple sentences
  - [ ] Add final review step before submission

---

### **Phase 2: Event-Actor-Role Generalization & Configurable Profiles (2.x.x releases)**

Generalize the participant model into a core Event–Actor–Role ontology. Introduce annotation events with configurable profiles, role-based claims, and prepare for AtoM plugin integration.

- [ ] **2.0.x — Event-Actor-Role Core Schema**
  - [ ] Design and implement core entities
    - [ ] `annotation_event`: events with datetime modes (exact/approx/unknown), location, profile reference
    - [ ] `actor`: generalized entity with canonical labels, aliases, identifiers
    - [ ] `event_actor_role`: link events to actors with role vocabulary (Victim, Perpetrator, Witness, Reporter, etc.)
    - [ ] `schema_profile`, `schema_field`, `schema_constraint`: configurable profile registry
  - [ ] Implement backward-compatibility mapping
    - [ ] Migrate existing victim/perpetrator records → actor + event_actor_role
    - [ ] Preserve legacy participant/victim/perpetrator semantics
  - [ ] Add role-based claims and evidence
    - [ ] `claim`: assertions on actors/roles with confidence and source evidence
    - [ ] `claim_evidence`: link claims to article mentions with coder metadata
- [ ] **2.1.x — Multi-Domain Profile Support**
  - [ ] Implement admin UI for profile definition
  - [ ] Support homicide (preloaded default) + custom domains
  - [ ] Role-based field visibility and validation
  - [ ] Support role-specific attributes (e.g., "conviction" shows for Perpetrator; "contact" for Witness)
- [ ] **2.2.x — Identity Resolution & Merge at Scale**
  - [ ] Reuse alias + promotion logic for actors
  - [ ] Enhance duplicate matching for multi-field scoring
  - [ ] Provide explainability for candidate scoring
  - [ ] Build actor merge queue and promotion UI

---

### **Phase 3: Graph Visualization & Statistical Reproducibility**

Enable research workflows with graph exploration, multi-source analysis, and exportable lineage.

- [ ] **3.0.x — Graph Explorer**
  - [ ] Implement graph backend: article–event–actor–role–claim edges
  - [ ] Build graph visualization UI
  - [ ] Support filtering and traversal by role, profile, confidence
- [ ] **3.1.x — Statistical Reproducibility**
  - [ ] Provide export modes: mention-level raw, actor-resolved, diff metadata
  - [ ] Document merge lineage and reversibility
  - [ ] Support audit trail for coder decisions and merge rationale

---

### **Phase 4: AtoM Plugin & Workbench Deployment**

Transition to AtoM plugin architecture. Implement plugin backend, specialized workbench UI, and targeted PWA for offline annotation workflows.

- [ ] **4.0.x — AtoM Plugin Backend (Symfony)**
  - [ ] Create AtoM plugin scaffold (access-homicide-tracker)
  - [ ] Implement plugin routes for CRUD on events, actors, roles, claims, evidence, merges, graph
  - [ ] Integrate with AtoM ACL and user management
  - [ ] Publish annotation layer API contract
- [ ] **4.1.x — Workbench UI in AtoM**
  - [ ] Build workbench pages: Event extraction, Actors/Roles, Connection graph, Merge queue, Review log
  - [ ] Integrate with AtoM article/information-object records as source anchors
  - [ ] Support annotation tabs within article record view
- [ ] **4.2.x — Targeted PWA & Offline Sync**
  - [ ] Implement service worker for workbench routes only (not full-site offline)
  - [ ] Cache manifest, vocabularies, recent records, and mutation queue
  - [ ] Use IndexedDB for offline queue with idempotency keys, ordered replay, and conflict handling
  - [ ] Implement sync endpoint: `/api/workbench/sync/batch`
- [ ] **4.3.x — Plugin Hardening & Pilot**
  - [ ] Run pilot with historical homicide data
  - [ ] Test offline reliability, merge quality, analysis consistency
  - [ ] Gather user feedback on workbench workflows
  - [ ] Prepare for production deployment

---

### **Phase 5: Migration & Sustainability**

Complete migration from standalone HMT. Archive legacy system. Establish ongoing plugin maintenance.

- [ ] **5.0.x — Data Migration from Current System**
  - [ ] Map articles → AtoM information objects
  - [ ] Map victims/perpetrators/events → actor + event_actor_role + claims
  - [ ] Preserve source URLs and article provenance
  - [ ] Support bulk ingest and reconciliation
- [ ] **5.1.x — Legacy Archive & Deprecation**
  - [ ] Archive current Next.js HMT as historical baseline
  - [ ] Migrate user research artifacts to AtoM plugin
  - [ ] Provide read-only access to legacy data during transition
- [ ] **5.2.x — Ongoing Maintenance & Extensibility**
  - [ ] Support additional research domains (trafficking, corruption, etc.)
  - [ ] Extend plugin with community-contributed profile templates
  - [ ] Maintain plugin compatibility with AtoM versions

---

## Participant Merge & Alias Promotion Contract (frozen)

Contract version: `2026-04-18`

- Contract source: `lib/contracts/participant-merge.ts`
- Published endpoint: `GET /api/participants/contract`
- Frozen operation endpoints:
  - `POST /api/participants/merge`
  - `POST /api/participants/alias-promotion`

### Merge request fields

- `sourceParticipantId`
- `targetParticipantId`
- `sourceRole` (`participant | victim | perpetrator`)
- `targetRole` (`participant | victim | perpetrator`)
- `reason` (optional)

### Alias promotion request fields

- `participantId`
- `role` (`participant | victim | perpetrator`)
- `aliasToPromote`

### Alias promotion result fields

- `participantId`

---

## Participant Form Contract

Contract version: `2026-04-19`

- Contract source: `lib/contracts/participant-form.ts`
- Published endpoint: `GET /api/participants/form-contract`
- Supported participant types:
  - `victim`
  - `perpetrator`
  - `other`
- `role`
- `newPrimaryName`
- `demotedPrimaryAlias`

The Homicide Media Tracker is designed for research teams to:

- Collect structured homicide data from media articles
- Detect duplicates across sources
- Support multi-user research workflows with optional remote sync
- Operate offline using a local LibSQL/SQLite database and optionally sync to a remote server
- Visualise and export data for analysis

## Quick Start (development)

Prerequisites: Node.js (>=14), npm (>=7) — see `package.json` `devEngines`.

Install dependencies:

```bash
npm install
```

Run in development (Next dev server + Electron):

```bash
# Start Next.js dev server
npm run dev

# In another terminal, start Electron connected to the dev server
npm run dev:electron

# Or run both together
npm start
```

The Next dev server runs on `http://localhost:3000` by default.

## Build & Package (production)

1. Build Next.js standalone server:

```bash
npm run build
```

2. Build Electron assets (main + preload) and prepare the app:

```bash
npm run build:electron
```

3. Package installers (platform-specific):

```bash
npm run package       # builds for all targets configured
npm run package:all   # runs build:electron then package
```

Note: Packaging requires proper code signing and platform-specific entitlements — avoid changing `build` fields without maintainers' approval.

## Architecture Summary

- Frontend: Next.js app lives in `app/` (App Router, Next 14). API routes are under `app/api/*/route.ts`.
- Electron main: `src/main/main.ts` handles app lifecycle, spawns or connects to the Next.js server, registers IPC handlers, and initialises the local database.
- Preload: `src/main/preload.ts` exposes a safe IPC bridge to the renderer.
- Database: Local LibSQL (via `@libsql/client`) and Drizzle ORM live in `lib/database/*`. The singleton `databaseManager` centralises connections, migrations, backup and sync logic.
- Packaging: `electron-builder` config lives in `package.json` `build` section. Packaged app includes `.next/standalone/server.js` and uses `release/app` files.

See `src/main/main.ts` and `lib/database/connection.ts` for the concrete implementations of server management and DB behaviours.

## Important Runtime Details (discoverable patterns)

- Dev vs Production server: In dev the main process expects `http://localhost:3000`. In production the main process finds an available port and spawns the standalone server (`.next/standalone/server.js`) with `PORT` set.
- Next.js server startup: `src/main/main.ts` implements `waitForServer()` with retries; failures in dev log actionable messages.
- Asset paths: Use `app.isPackaged` and `process.resourcesPath` when accessing `assets/` from the main process.
- IPC surface: `ipcMain.handle` handlers include `get-app-version`, `get-platform`, `get-server-port`, `database-status`, `database-sync`, `database-backup`, and `show-message-box`. Update `src/main/preload.ts` when changing these.
- Database init: `databaseManager.initialiseLocal()` is invoked during window creation; in packaged mode DB failures are tolerated (app runs without DB), while in development such failures rethrow to aid debugging.

## Developer Workflows & Commands

- `npm run dev` — Next.js development server
- `npm run dev:electron` — Launch Electron in development mode (requires Next dev server)
- `npm start` — Run both dev server and Electron concurrently
- `npm run build` — Next.js build (standalone output)
- `npm run build:electron` — Build Electron main & preload bundles and run `prepare-app` script
- `npm run prepare:electron` — Install native app dependencies; runs `scripts/check-native-dep.js` then `electron-builder install-app-deps`
- `npm run package` / `npm run package:all` — Create installers
- `npm run test` — Run Jest tests
- `npm run lint` / `npm run lint:fix` — Linting

## Database Patterns

- The `databaseManager` singleton in `lib/database/connection.ts` exposes methods:
  - `initialiseLocal()` — creates LibSQL client, initialises Drizzle, runs migrations
  - `configureRemote(url, authToken?)` — sets up remote LibSQL client and enables sync
  - `syncWithRemote()` — simplified sync routine called by `database-sync` IPC
  - `createBackup()` — copies local DB file and returns backup path
  - `getConfig()` / `updateConfig()` — access and change runtime config
  - `close()` — close local/remote clients and stop auto-sync

- Migrations are executed programmatically in `runMigrations()` and use `CREATE TABLE IF NOT EXISTS` — new migrations must be idempotent.

## API Routes & Conventions

- Use `app/api/*/route.ts` with named `GET`, `POST` exports returning `NextResponse`. Example: `app/api/health/route.ts`.
- Server-side logic (duplicate detection, heavy processing) lives in API routes so it runs inside the Next.js server (standalone or dev).

## Troubleshooting Notes (from backup README)

- Database errors during development: remove or re-create the DB if migrations fail. Example SQL approach from older docs referenced `newdatabase.sql` — proceed section-by-section.
- Default password mentioned in older docs (for deleting DB): `1234` — treat as legacy; do not hardcode secrets in code.
- Safari quirks: older notes mention Safari compatibility issues for web client; prefer Chrome during testing.

## Useful Files to Inspect When Changing Behaviour

- `src/main/main.ts` — server lifecycle, spawning logic, IPC handlers
- `src/main/preload.ts` — renderer-safe IPC exposure
- `lib/database/connection.ts` — DB manager, migration and backup logic
- `app/api/*/route.ts` — API route examples (health, sync, homicides, articles)
- `webpack.main.config.js`, `webpack.preload.config.js` — bundling config for main/preload processes
- `scripts/*` — packaging helpers (`prepare-app.js`, `check-native-dep.js`)

## Contribution Notes & Safety

- Avoid changing `build` packaging config without consultation (code signing, entitlements are platform-specific).
- When adding native modules, update `scripts/check-native-dep.js` and run `npm run prepare:electron` locally.

## Frequently Asked / Open Questions (from project notes)

- How should case IDs be structured? (URL + title + author hashing is used historically)
- Should homicides be primary entities with articles as supplementary? The codebase currently uses an article-centric approach but supports both.
- How to handle unidentified suspects? Consider restricting name fields until identification is confirmed.

If you'd like, I can:

- add a short developer checklist for PR reviewers (migrations, packaging, IPC changes),
- expand IPC examples with the exact `preload.ts` calls and a small renderer snippet,
- or add the virtualenv / runtime cache instructions from `.github/copilot/README.md` into a `CONTRIBUTING.md`.
