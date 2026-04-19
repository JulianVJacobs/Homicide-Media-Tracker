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
- Backward compatibility mapping:
  - Existing `victims` records load as `participantType = victim`
  - Existing `perpetrators` records load as `participantType = perpetrator`
- Persistence method:
  - `victim` rows continue using victim payload shape and victim persistence route(s)
  - `perpetrator` rows continue using perpetrator payload shape and perpetrator persistence route(s)
  - `participant` rows persist only shared identity fields in this phase; no merge/alias plumbing changes

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
- Run end-to-end scenario:
  1. Create participant as victim
  2. Change type to perpetrator
  3. Confirm merge controls still work unchanged

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
