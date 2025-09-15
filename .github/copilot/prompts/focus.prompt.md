---
mode: agent
description: Use thread relationships to adjust execution context and focus
---

# Execution Focus

**TRIGGER**: Use when thread relationships indicate need to change execution context or approach.

**PURPOSE**: Leverage thread relationships to become aware of relevant previous actions or disregard irrelevant work for current task focus.

## Focus Adjustment

### Relevant Actions Awareness

When thread relationships show relevant previous work:

- ✅ **Build On Success**: Continue from where previous threads left off
- ✅ **Learn From Failures**: Avoid approaches that didn't work previously
- ✅ **Reuse Solutions**: Apply successful patterns from related threads
- ✅ **Maintain Consistency**: Follow established architecture decisions

### Irrelevant Work Filtering

When thread relationships show unrelated previous work:

- ❌ **Disregard Unrelated Threads**: Don't let irrelevant work influence current approach
- ❌ **Avoid Context Pollution**: Focus on threads directly related to current task
- ❌ **Skip Completed Independent Work**: Don't revisit finished work unless it impacts current task
- ❌ **Ignore Deprecated Approaches**: Disregard threads marked as obsolete or replaced

## Context Switching Triggers

### When to Change Execution Context:

- **Dependency Discovery**: Found that current work depends on incomplete previous threads
- **Conflict Detection**: Current approach conflicts with established architecture from other threads
- **Solution Reuse**: Discovered existing solution in related thread that applies to current task
- **Pattern Following**: Previous threads establish patterns that should be maintained

### When to Maintain Current Focus:

- **Independent Work**: Current task is standalone and doesn't connect to existing threads
- **New Feature Development**: Building something genuinely new without dependencies
- **Isolated Bug Fix**: Fixing issue that doesn't impact broader system architecture
- **Experimental Work**: Exploring approaches that intentionally deviate from existing patterns

## Focus Execution

Based on thread relationship analysis:

1. **Context-Aware Execution**: Adjust approach based on relevant previous work
2. **Selective Information Use**: Apply insights from relevant threads, ignore irrelevant context
3. **Architecture Consistency**: Ensure current work aligns with established patterns from related threads
4. **Dependency Management**: Address prerequisites identified in thread relationships

## Decision Framework

**ASK YOURSELF**:

- Does previous work in related threads change how I should approach this task?
- Are there established patterns I should follow or avoid?
- What previous results should inform my current execution?
- What context can I safely ignore as irrelevant to current focus?

**OUTCOME**: Execute with appropriate awareness of relevant context while maintaining clear focus on current task requirements.
