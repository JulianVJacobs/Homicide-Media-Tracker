---
mode: agent
description: Orient within project context using thread relationships
---

# Context Orientation

**PRIMARY PROMPT**: Use after chat initialization to understand project context and previous work.

**PURPOSE**: Review thread relationships to orient yourself within the context of what has previously happened regarding the current request.

## Orientation Process

1. **Review Current Context**: Check `.github/copilot/contexts/{sessionId}.md` for session history
2. **Analyze Thread Relationships**: Identify relevant threads connected to current user request
3. **Cross-Reference Previous Work**: Search related context files for background information
4. **Assess Relevance**: Determine which previous work is relevant to current task
5. **Establish Context Baseline**: Understand what has been done before proceeding

## Thread Analysis

### Key Questions to Answer:

- **What related work exists?** Search for threads matching current request domain
- **What was the outcome?** Review previous results and current status
- **Are there dependencies?** Identify work that builds on or conflicts with previous efforts
- **What can be reused?** Find existing solutions or patterns applicable to current task
- **What should be avoided?** Identify previous approaches that didn't work

### Search Strategy:

```bash
# Search for relevant thread tags in contexts
grep_search "[thread-name]" in .github/copilot/contexts/*.md

# Common thread types to check:
# - [build-system] for build/config issues
# - [ui-components] for interface work
# - [database-schema] for data structure work
# - [api-routes] for backend functionality
# - [electron-integration] for desktop app features
```

## Context Integration

Use the discovered context to:

- **Inform Current Approach**: Build on successful previous work
- **Avoid Repetition**: Don't redo work that's already been completed
- **Respect Dependencies**: Understand how current work fits with existing architecture
- **Maintain Consistency**: Follow established patterns and conventions

## Output

Provide brief context summary noting:

- **Relevant Previous Work**: Key threads and outcomes related to current request
- **Current Status**: Where the project stands regarding the user's request
- **Approach Direction**: How you'll proceed based on existing context

**EFFICIENCY**: Focus on actionable context - what the user needs to know and what informs your approach.
