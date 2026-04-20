- Completed baseline: participant alias support and merge/promotion infrastructure are already implemented and must remain unchanged.
- Remaining scope: form contract publication first, then post-merge integration wiring and verification only.
- Hotel slice: publish unified participant form contract, define visibility/editability defaults, and track integration readiness/risk.

## Phase 2a Hotel — Form Contract (Published)

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

## Integration checkpoints (to execute after Echo/Foxtrot/Golf merge)

- Wire unified participant form submission to validation endpoints.
- Verify list UI renders participant type labels correctly.
- Verify backward compatibility for legacy victim/perpetrator records.
- Verify all lanes use the exact `participantType` key (`victim` | `perpetrator` | `participant`) with no naming drift.
- Run end-to-end scenario:
  1. Create participant as victim
  2. Change type to perpetrator
  3. Confirm merge controls still work unchanged

## Fleet execution proposal

### Fleet contract proposal

- Proposed planned version: `1.2.0`
- Version rationale: additive user-facing completion of the unified participant step with backward compatibility for existing records.
- Approval state: pending user approval before fleet launch.
- Allowed change class: complete the already-published participant form contract and integration only; do not expand alias or merge behavior.
- Phase branch: `phase/1.2.0`
- Merge policy: eager merge into the phase branch after required verification, followed by one final PR to `origin/main`.

### Parallel-safe lane decomposition

- `[1.2.0][00-conductor] Integrate phase 1.2.0 fleet`
  - Owned surface: phase branch governance, manifest updates, merge policy enforcement, final PR to `origin/main`.
- `[1.2.0][01-form-submission] Wire unified participant form submission to validation endpoints`
  - Owned surface: participant form submission flow, relevant participant validation routes, and request-contract alignment.
- `[1.2.0][02-list-rendering] Render participant type labels and visibility state in list UI`
  - Owned surface: participant list UI, participant type label rendering, and display helpers.
- `[1.2.0][03-compat-verification] Verify legacy loading and end-to-end participant type switching`
  - Owned surface: regression tests, compatibility assertions, and the create-as-victim then switch-to-perpetrator verification path.

### Coordination state

- Manifest path: `.github/fleet/1.2.0/manifest.yaml`
- Required lane state fields: lane id, branch, PR status, owned surface, readiness, blockers, and verification summary.

### Merge order proposal

1. `[1.2.0][00-conductor]` creates `phase/1.2.0` and publishes the manifest.
2. `[1.2.0][01-form-submission]` and `[1.2.0][02-list-rendering]` run in parallel against the approved contract.
3. `[1.2.0][03-compat-verification]` rebases on the phase branch after the relevant worker merges and records final verification.
4. `[1.2.0][00-conductor]` opens the final PR from `phase/1.2.0` to `origin/main`.

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

## Phase 3 Lima — Event-Actor-Role Integration (In Progress)

### Coordination notes
- India/Juliet/Kilo coordination is active via CI lane monitoring (`copilot/featindia-event-schema`, `copilot/featlima-integration` currently running).
- Contract alignment locked in this branch through `GET /api/events/contract` with frozen payload keys for event, actor, event_actor_role, and claim.
- No participant/victim/perpetrator merge plumbing changes introduced in this integration slice.

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

### Remaining before final Phase 3 closeout
- Validate final India/Juliet/Kilo merged payloads against this frozen contract shape.
- Execute post-merge end-to-end create event → add actors → assign roles → add claims flow in integrated lane.
- Mark Phase 3 complete after merged-lane verification.
