# Homicide Media Tracker

## Purpose

A data collection and analysis tool for tracking homicide cases from media sources. This project supports both a web-style Next.js development experience and a native desktop distribution via Electron.

This single README combines development guidance from the project and an older backup README. It focuses on practical steps, architecture, and troubleshooting for contributors and maintainers.

## Roadmap

**Current version: 1.1.0**

- [ ] **1.x.x**
  - [x] **1.2.x**
    - [x] Make PWA offline-first
      - [x] Implement service worker for asset caching
      - [x] Use IndexedDB for storage
  - [ ] Combine victim and perpetrator steps into "participants" step
    - [ ] Add dropdown to switch between profiles
    - [ ] Refactor forms for participant type
    - [ ] Make profiles fully configurable
  - [ ] Add "alias" field to every participant
    - [ ] Update schema to include alias
    - [ ] Add input field to participant form
  - [ ] Perpetrator "unknown" input as checkbox
    - [ ] Replace text input with checkbox
    - [ ] Update validation logic
  - [ ] Victim-perpetrator relationship "other" option
    - [ ] Add text input for custom relationships
    - [ ] Allow saving custom options for reuse
  - [ ] Perpetrator sentencing: support multiple sentences
    - [ ] Update schema for multiple sentences
    - [ ] Refactor UI for ordinal + multiple life sentences
  - [ ] Add final review step
    - [ ] Summarise all entries before submission
    - [ ] Add review modal to UI
  - [ ] Add "type of murder" field to perpetrator form
    - [ ] Add checklist input
    - [ ] Support "other" option
  - [ ] Change "type of murder" from dropdown to checklist
    - [ ] Refactor UI for multiple selections
    - [ ] Add custom "other" option
  - [x] Make participant entries editable after "add"
    - [x] Add edit button to participant list
    - [x] Implement edit modal
  - [ ] Show detailed summary of participants after "add"
    - [ ] Display summary table
    - [ ] Highlight incomplete/invalid entries
- [ ] **2.x.x**
  - [ ] Generalise schema to event reporting model
    - [ ] Design new core entities: Event, Report, Participant, Relationship
    - [ ] Migrate existing homicide data to new schema
    - [ ] Preserve homicide-specific schema as preloaded configuration
  - [ ] Support reports about any class of event
    - [ ] Refactor event creation logic
    - [ ] Add event type selector
  - [ ] Events will have participants, and participants can relate to other participants
    - [ ] Implement flexible participant relationships
    - [ ] Update UI for relationship mapping
  - [ ] Template/profile system for participant types
    - [ ] Define types (e.g., "victim", "perpetrator") and custom fields
    - [ ] Implement dynamic form generation
  - [ ] Dynamically generated forms based on profile and fields
    - [ ] Refactor form logic for dynamic fields
    - [ ] Add profile selection UI
  - [ ] Implement template/profile system and dynamic form logic
    - [ ] Enable flexible data entry
    - [ ] Test with multiple event types
  - [ ] Ensure backward compatibility and load preloaded configuration on setup
    - [ ] Test migration for existing users
    - [ ] Add fallback logic for legacy data
- [ ] **x.x.x**
  - [ ] Report queue
    - [ ] Implement queue logic for backlog reports
    - [ ] Add UI for processing queued reports
  - [ ] Draft support
    - [ ] Allow saving articles/participants as drafts
    - [ ] Add review and completion options
  - [ ] Detailed Sync Status Visualization
    - [ ] Implement circular progress tracking component
    - [ ] Animate fill for in-progress syncs
    - [ ] Show green check mark if all records are synced
    - [ ] Show red cross if any record fails

---

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
