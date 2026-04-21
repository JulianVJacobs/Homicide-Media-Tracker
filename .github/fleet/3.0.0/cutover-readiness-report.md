# [3.0.0][08-regression-migration] Cutover Readiness Report

## Scope
- Lane: `08-regression-migration`
- Base phase branch: `copilot/300-00-conductor-recovery`
- Evaluation date: 2026-04-21

## Full-suite verification
- `npm run lint` ✅
- `npm run test` ✅
  - 29 passed suites, 105 passed tests, 0 failures

## Regression boundary coverage
Added regression suite: `__tests__/phase-3-regression-migration.test.ts`

Coverage areas validated:
1. **Workbench → plugin API boundary**
   - verifies workbench adapter routes reads through configured plugin API base URL and contract response handling.
2. **ACL enforcement boundary**
   - verifies unauthorized plugin endpoint requests are rejected before domain service invocation and authorized requests proceed.
3. **Offline replay boundary**
   - verifies duplicate offline replay request IDs are idempotently de-duplicated through sync bridge semantics.
4. **Domain persistence boundary**
   - verifies plugin domain persistence port round-trips records (save/get) without data shape loss.

Validation command:
- `npm run test -- __tests__/phase-3-regression-migration.test.ts` ✅ (4/4 passing)

## Migration rehearsal
Script committed:
- `scripts/migration-rehearsal.cjs`

Execution:
- `node scripts/migration-rehearsal.cjs` ✅

Artifact:
- `.github/fleet/3.0.0/migration-rehearsal-result.json`

Result summary:
- migration statements applied: 64
- baseline dataset rows preserved:
  - victims: 1 → 1 (no loss)
  - perpetrators: 1 → 1 (no loss)
- backfill integrity checks:
  - actor rows created from legacy records: 2
  - legacy identifiers created: 2
- verification flags:
  - `noVictimLoss: true`
  - `noPerpetratorLoss: true`
  - `sourceRowsPreserved: true`
  - `actorBackfillPresent: true`
  - `legacyIdentifiersPresent: true`

## Known risks
- Rehearsal fixture is intentionally production-representative but minimal; full production cutover should still include pre-cut backup and post-cutover row-count spot checks on larger sampled cohorts.
- SQL fallback for `ADD COLUMN IF NOT EXISTS` compatibility is exercised in rehearsal script for libsql/sqlite parser variance and should be retained for repeated rehearsals.

## Recommendation
**Go** for phase 3 integration cutover from a regression + migration readiness perspective.

Lane 08 sign-off criteria met: full suite green, boundary regressions passing, migration rehearsal completed with no observed data loss.
