# Homicide Media Tracker — Copilot Agent Instructions

This file gives focused, actionable guidance for AI coding agents working in this repository. Keep content concise and only document discoverable, repository-specific patterns.

1. Big-picture architecture

- **Frontend:** Next.js app lives in `app/` (Next 14 app-router). Pages and API routes use the `app` directory (see `app/api/*/route.ts`).
- **Electron host:** Desktop shell in `src/main/*` (Electron main process). `src/main/main.ts` starts the Next.js server in production or connects to the dev server in development.
- **Preload & Main build:** Preload and main processes are bundled via `webpack.preload.config.js` and `webpack.main.config.js` and built with `npm run build:main` and `npm run build:preload`.
- **Database:** Local LibSQL (SQLite-like) + Drizzle ORM in `lib/database/*`. The singleton `databaseManager` is used by the main process and exposed to renderer via IPC handlers in `src/main/main.ts`.
- **Packaging:** `electron-builder` configuration is in `package.json` (`build` section) and assets live in `assets/`. Packaged app includes a standalone Next.js server (`.next/standalone/server.js`) and uses `release/app` as the packaged app content.

2. Key developer workflows & commands

- **Run web dev server:** `npm run dev` (starts Next.js on `http://localhost:3000`).
- **Run Electron in dev:** Start Next and Electron together: `npm run start` (uses `concurrently`). Alternatively run `npm run dev` then `npm run dev:electron`.
- **Build app:** `npm run build` builds Next.js. To build Electron main/preload and prepare app assets run `npm run build:electron`.
- **Package installers:** `npm run package` or `npm run package:all` after `build:electron`.
- **Native deps:** `npm run prepare:electron` runs `electron-builder install-app-deps` and `ts-node scripts/check-native-dep.js`.
- **Tests & linting:** `npm run test` (jest), `npm run lint` and `npm run lint:fix`.

3. Important runtime behaviours to know

- **Dev vs Production server startup:** In development the main process expects Next.js dev server at `http://localhost:3000`. In production the main process spawns the standalone server (`.next/standalone/server.js`) and passes `PORT` to it. See `src/main/main.ts` for port discovery and `waitForServer` logic.
- **IPC surface:** The main process exposes IPC handlers (via `ipcMain.handle`) for application version, platform, server port, and DB operations: `database-status`, `database-sync`, `database-backup`, `show-message-box`. Use these keys when adding renderer-side calls (renderer uses `preload.ts` for safe exposure).
- **Preload contract:** `src/main/preload.ts` implements the safe bridge for renderer to call the above IPC methods. When changing IPC names or signatures, update both `preload.ts` and callers in `app/`.
- **Database initialisation:** `databaseManager.initialiseLocal()` is called during `createWindow()` in `main.ts`. In packaged apps, failures are tolerated (app continues without DB), but in development failures are rethrown — useful when debugging migration/driver issues.

4. Project-specific conventions & patterns

- **Next API routes:** Use `app/api/*/route.ts` with named exports (`GET`, `POST`, etc.) returning `NextResponse`.
- **Database access pattern:** Use `databaseManager.getLocal()` to obtain a Drizzle instance (throws if not initialised). The manager exposes high-level methods: `configureRemote`, `syncWithRemote`, `createBackup`, `getConfig`, `updateConfig`, `close`.
- **Migrations:** Simple SQL migrations are executed programmatically in `lib/database/connection.ts` via `runMigrations()` — new schema changes should be idempotent (`IF NOT EXISTS`) and avoid destructive operations without migration paths.
- **Assets in packaged app:** Asset lookup uses `app.isPackaged` to choose `process.resourcesPath` vs local paths. Use `getAssetPath` pattern found in `main.ts` when referencing assets from main process.

5. Integration points & external dependencies

- **LibSQL / Drizzle:** The app uses `@libsql/client` and `drizzle-orm`. Client creation uses multiple fallback strategies in `connection.ts` — follow those patterns when adding new connection code.
- **electron-updater & auto-update:** `electron-updater` is used in `AppUpdater` — packaging and signing settings are in `package.json` build config.
- **Electron + Next interoperability:** The Next.js app and Electron exchange configuration via environment variables and IPC. The main process sets `PORT` for the standalone server and passes `ELECTRON_RUN_AS_NODE` in packaged mode when spawning the server.

6. Examples (copy-paste safe)

- Start Next dev server and open Electron (development):
  - `npm run dev`
  - `npm run dev:electron` (or just `npm run start` to run both)
- Call DB status from renderer (pseudo):
  - `const status = await window.api.invoke('database-status')` — confirm exact preload API in `src/main/preload.ts`.

7. Files to inspect when changing behavior

- `src/main/main.ts` — app lifecycle, Next.js child process, IPC handlers, DB init.
- `src/main/preload.ts` — renderer-to-main safe bridge.
- `lib/database/connection.ts` — DB manager, migrations, sync logic.
- `app/api/*/route.ts` — Next API route pattern examples.
- `webpack.*.config.js` — main and preload bundling details.
- `scripts/*` — helper scripts for packaging and native dependency checks (e.g., `scripts/prepare-app.js`, `scripts/check-native-dep.js`).

8. When modifying tests, builds or CI

- CI should run `npm ci` then `npm run build` to verify Next build and `npm run build:main`/`build:preload` for Electron bundling if required by the job. Packaging steps require `node` and `npm` matching `devEngines` in `package.json`.

9. Safety & limits for agents

- Do not modify packaging `build` fields without human approval; signing and entitlements are platform-sensitive.
- Avoid adding native binaries or large assets; use `assets/` and update `build.files`/`extraResources` accordingly.

10. Further notes and maintainers

- Primary code authors: check `package.json` `author` and `contributors` for contacts.
- Dev environment: Node >=14 and npm >=7 as declared in `devEngines`.

If any section is unclear or you want more examples (preload APIs, IPC usage, or DB query samples), tell me which area to expand and I'll iterate.
