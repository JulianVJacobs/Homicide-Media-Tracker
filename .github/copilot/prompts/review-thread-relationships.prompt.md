---
mode: agent
description: Review and update thread relationships only when necessary
---

# Thread Relationship Review

**TRIGGERED BY**: `update-context.prompt.md` when thread relationships may have changed.

**PRINCIPLE**: Only update thread relationships when there are actual connections or status changes. Avoid unnecessary relationship mapping.

## Review Criteria

### Update Thread Relationships When:

- ✅ **New Cross-Thread Dependencies**: Current work depends on or affects other threads
- ✅ **Thread Status Changes**: Active threads become inactive, or inactive threads reactivate
- ✅ **Work Continuity**: Current session extends work from previous threads
- ✅ **Conflict Resolution**: Thread dependencies conflict and need resolution

### Do NOT Update When:

- ❌ **Isolated Work**: Current task has no relationship to existing threads
- ❌ **Routine Updates**: Simple context logging without dependencies
- ❌ **Similar Work**: Work is similar but independent (avoid false connections)
- ❌ **Completed Threads**: Touching completed work that remains completed

## Thread Discovery Process

1. **Search Existing Contexts**: Use `grep_search` with thread tag patterns `[thread-name]` in `.github/copilot/contexts/*.md`
2. **Identify Active Threads**: Find threads marked as active in current or recent contexts
3. **Analyze Dependencies**: Determine if current work connects to existing threads
4. **Update Only If Necessary**: Create/modify thread relationships only when genuine connections exist

## Thread Types (Reference)

- `typescript-setup`, `build-system`, `database-schema`, `ui-components`
- `electron-integration`, `api-routes`, `context-retention`, `security-implementation`

## Update Format

When updates are necessary:

- **Thread Tags**: Use `[timestamp][model][thread-name]` format
- **Relationship Mapping**: Document specific connections between threads
- **Status Updates**: Mark threads as active/inactive based on current work

**EFFICIENCY PRINCIPLE**: Fewer, accurate thread relationships are better than many loose connections.
