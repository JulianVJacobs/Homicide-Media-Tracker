Context File Conventions
------------------------

Each session context file lives in this directory and follows a stable convention so agents and humans can interoperate.

File naming
- Filenames should contain the deterministic UUID that maps to the chat log in `.copilot-chats/` (e.g. `f4b2e8c1-... .md`).

Frontmatter (human):
- Files use YAML frontmatter with fields such as `session_id`, `chat_title`, `creation_date`, `last_message_date`, `extended_from`, `status`, `active_threads`, and `requester`.

Machine block (optional but recommended):
- Include a compact JSON machine block between `<!--machine-json-start-->` and `<!--machine-json-end-->` to allow deterministic parsing.

Example (minimal):
```
---
session_id: "2d3a9b4e-6c1f-4a2b-9d7e-0f1a2b3c4d5e"
chat_title: "Extended Session - Feature Implementation Start"
creation_date: "2025-09-12T00:00:00+00:00"
status: "active"
active_threads: ["server-deployment-prototype"]
---

<!--machine-json-start-->
{
  "session_id": "2d3a9b4e-6c1f-4a2b-9d7e-0f1a2b3c4d5e",
  "schema_version": 1,
  "active_threads": ["server-deployment-prototype"]
}
<!--machine-json-end-->

```

Validation
- Use `scripts/context-validate.sh <file>` to validate frontmatter and the machine block (if present). A JSON Schema for the machine block lives at `.github/copilot/contexts/schema.json`.

Thread relationships
- To understand cross-thread dependencies, agents may consult `.github/contexts/thread-relationships.json`. The machine block can include `primary_thread`, `related_threads`, or a `thread_relationships` map to make thread expansion deterministic.
