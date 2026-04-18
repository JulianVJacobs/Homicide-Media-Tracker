You are continuing implementation on repository Homicide-tracker-MASTER, branch main. This is a continuation task, not a greenfield task.

Rules:
1. Continue from current repository and PR state only.
2. Name the PR as [<Phase>] <Description>
3. Do not redo completed participant alias support.
4. Before coding, read and summarise in 3 bullets:
   - Completed work
   - Remaining work
   - This task slice
5. If your proposed work overlaps completed work, stop and adjust scope.
6. On completion, update the plan with:
   - Completed
   - Remaining
   - Risks or blockers
7. If a PR is created, update plan immediately after PR creation.
8. Update plan again after PR acceptance or merge.

Completed baseline you must treat as done:
- Participant aliases are implemented across schema, API wiring, forms, and targeted tests.
- Alias normalisation and participant search integration are already in place.

Task slice to implement now:
- Participant merge management flow.
- Alias promotion flow so an alias can become primary name.
- Preserve previous primary name as alias after promotion.
- Ensure duplicate matching uses primary name plus aliases.

Required outputs:
1. Brief pre-implementation scope confirmation.
2. Code changes limited to this slice.
3. Verification summary (tests and manual checks run).
4. Plan update entries (post-task, post-PR creation, post-merge when applicable).

Stop conditions:
- Missing requirements, unclear merge rules, or conflicting repository state. Ask focused clarification questions instead of guessing.