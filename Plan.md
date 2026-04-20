- Phase 3 lane closeout status (archived snapshot):
  - Completed: event_actor_role, claim, and claim_evidence tables added with FK wiring; default event-role vocabulary seeding added; basic event-role and role-claim CRUD endpoints implemented.
  - Remaining (historical note): `2.0.0/00-conductor` integration wiring and any stricter domain-level predicate/role policy decisions if product required them.
  - Blockers: none for backend schema/API delivery; current implementation supports free-form claim predicates and flexible selector_json evidence formats.

- Completed baseline: participant alias support and merge/promotion infrastructure are already implemented and must remain unchanged.
- Remaining scope: form contract publication first, then post-merge integration wiring and verification only.
- Phase 2a integration slice (archived): publish unified participant form contract, define visibility/editability defaults, and track integration readiness/risk.

## Phase 2a contract (archived, legacy alias: Hotel) — Published

### 1) Type selector contract

- Field key: `participantType`
- UI control: single-select dropdown
- Allowed values (persisted):
  - `victim`
  - `perpetrator`
  - `participant` (display label: `Other`)
- Default type for new rows: `victim`
- New-entry behavior: selecting `Other` (`participant`) is allowed during create flow in this phase.
- Backward compatibility mapping:
  - Existing `victims` records load as `participantType = victim`
  - Existing `perpetrators` records load as `participantType = perpetrator`
- Persistence method:
  - `victim` rows continue using victim payload shape and victim persistence route(s)
  - `perpetrator` rows continue using perpetrator payload shape and perpetrator persistence route(s)
  - `participant` rows persist only shared identity fields in this phase
  - Existing merge/alias plumbing remains unchanged and continues to apply to current victim/perpetrator merge flows

### 2) Field visibility contract by type

- Shared fields (all types):
  - Name
  - Alias
- Victim-only fields:
  - `dateOfDeath`, `placeOfDeathProvince`, `placeOfDeathTown`, `typeOfLocation`, `policeStation`
  - `sexualAssault`, `genderOfVictim`, `raceOfVictim`, `ageOfVictim`, `ageRangeOfVictim`
  - `modeOfDeathGeneral`, `modeOfDeathSpecific`
- Perpetrator-only fields:
  - `perpetratorRelationshipToVictim`, `suspectIdentified`, `suspectArrested`, `suspectCharged`
  - `conviction`, `sentence`
- Other (`participant`) type fields in this phase:
  - Shared fields only (Name + Alias)

### 3) Profile editability scope

- **Phase 2a scope decision:** user-editable (not admin-only)
- Rationale: current app flow has no enforced admin-only profile edit gate in participant input paths.

## Integration checkpoints (archived, executed after `1.2.1` worker lane merge)

- Wire unified participant form submission to validation endpoints.
- Verify list UI renders participant type labels correctly.
- Verify backward compatibility for legacy victim/perpetrator records.
- Verify all lanes use the exact `participantType` key (`victim` | `perpetrator` | `participant`) with no naming drift.
- Run end-to-end scenario:
  1. Create participant as victim
  2. Change type to perpetrator
  3. Confirm merge controls still work unchanged

## Fleet orchestration schema (canonical)

### Canonical identity and naming

- Fleet identity token: approved planned version (semver)
- Conductor lane id: `00`
- Worker lane ids: `01+` (zero-padded)
- Lane name format: `[<planned-version>][<agent-id>-<short-name>] <task-description>`
- Phase branch: `phase/<planned-version>`
- Worker branch: `lane/<planned-version>/<agent-id>-<short-name>`

### Historical alias policy

- Legacy phonetic lane labels (for example Lima/India/Juliet/Kilo) are archived-only references.
- All active planning, delegation, and review uses canonical semver lane ids only.

## Fleet execution proposal (active)

### Fleet contract proposal

- Proposed planned version: `2.1.0`
- Version rationale: additive support for multi-domain profiles and role-based field visibility following completed `2.0.x` schema merge.
- Approval state: pending user approval before fleet launch.
- Allowed change class: additive profile and validation features only; no breaking schema removals.
- Phase branch: `phase/2.1.0`
- Merge policy: eager merge into the phase branch after required verification, followed by one final PR to `origin/main`.

### Parallel-safe lane decomposition

- `[2.1.0][00-conductor] Integrate phase 2.1.0 fleet`
  - Owned surface: phase branch governance, manifest updates, merge policy enforcement, final PR to `origin/main`.
- `[2.1.0][01-profile-admin-ui] Build schema profile administration UI`
  - Owned surface: profile management UI, profile route handlers, and profile DTO validation.
- `[2.1.0][02-role-visibility] Implement role-based field visibility and constraints`
  - Owned surface: field visibility rules, form rendering gates, and role constraint evaluation.
- `[2.1.0][03-domain-seed-support] Add homicide default + custom domain seed lifecycle`
  - Owned surface: seed loaders, migration-safe seed routines, and domain registration APIs.
- `[2.1.0][04-regression-verification] Validate backward compatibility and integration`
  - Owned surface: regression tests, compatibility assertions, and end-to-end role/profile workflows.

### Coordination state

- Manifest path: `.github/fleet/2.1.0/manifest.yaml`
- Required lane state fields: lane id, branch, PR status, owned surface, readiness, blockers, and verification summary.

### Merge order proposal

1. `[2.1.0][00-conductor]` creates `phase/2.1.0` and publishes the manifest.
2. `[2.1.0][01-profile-admin-ui]`, `[2.1.0][02-role-visibility]`, and `[2.1.0][03-domain-seed-support]` run in parallel against the approved contract.
3. `[2.1.0][04-regression-verification]` rebases on the phase branch after worker merges and records final verification.
4. `[2.1.0][00-conductor]` opens the final PR from `phase/2.1.0` to `origin/main`.

## Milestone status

### Completed

- Published form contract and implementation assumptions for parallel lanes.
- Fixed scope to integration-only (alias + merge plumbing unchanged).

### Remaining

- Post-merge integration wiring across unified form, validation endpoints, and list UI.
- Post-merge regression verification and end-to-end scenario execution.

### Risks / blockers

- If lane implementations use different field keys for `participantType`, contract drift may require alignment patch.
- If `participant` (Other) persistence shape diverges from shared-fields-only assumption, contract revision will be needed.

## Phase 3 Lima — Event-Actor-Role Integration (Completed, merged to origin/main)

### Merge record (2026-04-20)

- ✅ `[2.0.0][00-conductor]` final integration merged: PR #13 (`featlima-integration`) at `99c0f60` on `origin/main`.
- ✅ `[2.0.0][01-event-schema]` merged: PR #14 (`featindia-event-schema`) at `5fc380b` on `origin/main`.
- ✅ `[2.0.0][02-actor-generalization]` and `[2.0.0][03-role-claims]` integrated via conductor merge commits (`f8dc54c`, `ca65f90`) and resolved in final integration.
- Historical aliases: `00-conductor=Lima`, `01-event-schema=India`, `02-actor-generalization=Juliet`, `03-role-claims=Kilo`.
- ✅ Contract remains frozen at `GET /api/events/contract` with event, actor, event_actor_role, and claim payload keys.

### Completed in this integration branch

- Published Phase 3 contract freeze endpoint: `GET /api/events/contract`.
- Added integrated event read endpoint: `GET /api/events/:id`.
- Added backward-compatible actor projection from legacy `victims` and `perpetrators` records.
- Added default role projection (`victim` / `perpetrator`) with explicit detail-payload override support.
- Added claim projection support from event details payload.
- Added focused tests for contract freeze and integration payload mapping.

### Verification status

- ✅ `npm run lint`
- ✅ `npm run test`
- ⚠️ `npm run build` blocked in sandbox by external font fetch (`fonts.googleapis.com`) and an existing unrelated module-resolution error in `app/api/participants/form-contract/route.ts`.

### Phase 3 closeout status

- ✅ Final India/Juliet/Kilo payloads were merged and aligned with the frozen contract shape.
- ✅ Integration branch conflicts were resolved before merge.
- ✅ Phase 3 implementation merge is complete.

### Next slice

- Continue with Phase 3 graph/exploration roadmap items (graph explorer + statistical reproducibility exports).
- Run the self-contained news outlet searchable combobox feature lane (`feat/november-outlet-combobox`) in parallel, since it has no India/Juliet/Kilo dependency.
