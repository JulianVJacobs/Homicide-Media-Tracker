---
description: 'Generate Fleet Orchestrator launch prompts for conductor and worker lanes in @cloud format'
name: generate fleet prompts
argument-hint: 'Provide planned version, lane list, dependencies, merge policy, and constraints'
agent: 'Fleet Orchestrator'
---

Generate launch-ready prompts for a Fleet Orchestrator phase.

Inputs to use from this request:

- Planned version and phase name
- Allowed change class and merge policy
- Phase branch and final merge target
- Conductor lane details
- Worker lane details (lane id, purpose, branch, dependencies, owned surface)
- Stop conditions and verification expectations

Rules:

1. Output only code blocks that can be pasted directly into chat.
2. Every code block must start with @cloud on the first line.
3. Provide one code block per lane, in launch order (conductor first).
4. Include branch, target branch, PR prefix, dependencies, owned surface, required outputs, and stop conditions.
5. Keep prompts strict about scope boundaries and semver contract enforcement.
6. Use canonical lane naming format: [<planned-version>][<agent-id>-<short-name>] <task-description>.
7. If dependencies block a lane, clearly state start condition inside that lane prompt.
8. Do not include explanatory prose between code blocks.

Output structure:

- Code block 1: conductor prompt
- Code blocks 2..N: worker prompts in dependency-safe order

Template shape to follow for each lane:

```text
@cloud You are <lane name>.

Lane identity:
- Branch: <lane branch>
- Target branch: <phase branch>
- PR title prefix: <lane prefix>

Fleet contract:
- Planned version: <planned version>
- Allowed change class: <change class>
- Merge policy: <merge policy>
- Dependency: <if applicable>

Task:
- <task bullets>

Owned surface:
- <owned surface bullets>

Required outputs:
- One PR to <phase branch>
- Verification summary: <tests/lint/behavior checks>
- Manifest status updates: readiness, blockers, PR metadata

Stop conditions:
- <stop condition bullets>
```

Now generate the launch prompts for this specific fleet request using the supplied arguments and constraints.
