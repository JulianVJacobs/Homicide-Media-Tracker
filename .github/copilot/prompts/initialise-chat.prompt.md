---
mode: agent
description: Initialize chat session by searching own logs and creating context file per copilot-config.yml
---

# Chat Initialization & Context Creation

**REQUIRED**: Search for your own chat session data and create a context log following `.github/copilot/copilot-config.yml` specifications.

## Core Actions

1. **Locate Session Data**: Search `.copilot-chats/{sessionId}.json` for current chat metadata
2. **Extract Chat Information**: Parse chat title, creation date, messages, and tool usage
3. **Create Context Log**: Generate `.github/copilot/contexts/{sessionId}.md` with machine-readable format

**Context Format**: Use EXACT template from `.github/copilot/copilot-config.yml` → `context_format.exact_template_example`

## Session Identification Strategy

**SIMPLE & RELIABLE**: Use current date/time to uniquely identify sessions.

### Timestamp-Based Session Discovery

1. **Get Current Time**: Run `date` command to get actual system timestamp
2. **State Current Time**: Declare the exact date and time from the `date` command output
3. **Wait for Log Update**: Search chat files after a delay to allow logs to update
4. **Search Chat Files**: Use the timestamp string to locate your session in `.copilot-chats/`
5. **Extract Session ID**: Parse the matching filename to get session ID

### Implementation

```bash
# Step 1: Get actual system timestamp
date

# Step 2: Use the EXACT output from date command (example: "Tue Sep  9 13:54:24 UTC 2025")
# State this timestamp in your response

# Step 3: After stating current time, attempt search with multiple tries using EXACT timestamp:
# Attempt 1: Wait 3 seconds
sleep 3 && grep -l "Tue Sep  9 13:54:24 UTC 2025" .copilot-chats/*.json | head -1

# If no results, attempt 2: Wait another 3 seconds
sleep 3 && grep -l "Tue Sep  9 13:54:24 UTC 2025" .copilot-chats/*.json | head -1

# If still no results, attempt 3: Wait another 3 seconds
sleep 3 && grep -l "Tue Sep  9 13:54:24 UTC 2025" .copilot-chats/*.json | head -1
```

### Search Process

1. **Get System Time**: Run `date` command to get actual current timestamp
2. **State Current Time**: Declare exact date and time from system (separate action)
3. **Multi-Attempt Search**: Try up to 3 times with 3-second delays between attempts
4. **Search Commands**:
   - Attempt 1: `sleep 3 && grep -l "{current_date}" .copilot-chats/*.json | head -1`
   - Attempt 2: `sleep 3 && grep -l "{current_date}" .copilot-chats/*.json | head -1`
   - Attempt 3: `sleep 3 && grep -l "{current_date}" .copilot-chats/*.json | head -1`
5. **Extract Session ID**: Filename format is `{sessionId}.json`
6. **Create Context**: Generate `.github/copilot/contexts/{sessionId}.md`

**CRITICAL TIMING**: There is a delay between when agents state information and when it appears in logs. Use multiple attempts with delays (3 attempts, 3 seconds each) to handle timing variations and ensure the session is found.

**GUARANTEE**: Every timestamp is unique - this method should be reliable for session identification.

**PRINCIPLE**: Considering exactly one chat can be initialised at a time, it is highly unlikey that any previous agent would've stated the exact time and date the current agent is stating.

## Required Context Format (per copilot-config.yml)

- **YAML Frontmatter**: session_id, chat_title, creation_date, last_message_date, extended_from, status, active_threads
- **Request-Action-Result Log**: Each user interaction as separate entry
- **Tool Execution Analytics**: Summary of tools used and outcomes
- **Current State**: File modifications and thread status
- **Thread Tagging**: Use `[timestamp][model][thread-name]` format

## Auto-Extraction Process

1. Parse `.copilot-chats/{sessionId}.json` for chat metadata
2. Extract request-action-result patterns from conversation
3. Identify active/inactive threads from tool usage
4. Create machine-readable context file optimized for AI agent parsing

Execute this initialization immediately upon session start to establish proper context retention.
