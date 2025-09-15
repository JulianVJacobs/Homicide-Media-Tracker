---
mode: agent
description: Update context file after completing tasks and trigger thread relationship review
---

# Context Update & Thread Management

**REQUIRED**: Update `.github/copilot/contexts/{sessionId}.md` after completing tasks, then trigger thread relationship review if needed.

## Primary Actions

1. **Log Session Actions**: Create/append request-action-result entries to context file
2. **Update Current State**: Record file modifications, tool usage, and outcomes
3. **Trigger Thread Review**: Call `review-thread-relationships.prompt.md` only if thread relationships may have changed

## Context Update Format

Update the existing context file with:

- **Request-Action-Result Entry**: New user interaction logged
- **Tool Execution Analytics**: Summary of tools used and outcomes
- **Current State**: File modifications and active thread status
- **YAML Frontmatter**: Update session metadata if needed

## Thread Review Trigger Criteria

Call `review-thread-relationships.prompt.md` ONLY when:

- ✅ New work threads are created or modified
- ✅ Existing threads are connected to new work
- ✅ Thread status changes (active → inactive or vice versa)
- ❌ **AVOID**: Simple context updates without thread implications
- ❌ **AVOID**: Routine logging without cross-thread dependencies

## Integration Pattern

Execute context updates as part of task completion, not as separate step. Minimize unnecessary thread relationship updates to avoid context bloat.

## Required Context Location

- **File**: `.github/copilot/contexts/{sessionId}.md`
- **Format**: Machine-readable per `.github/copilot/copilot-config.yml`
- **Priority**: Accurate logging over verbose documentation
