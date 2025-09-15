# Copilot Instructions

This Markdown file is designed to orchestrate the flow of tasks for AI agents. It serves as an index to the structured configuration data in the JSON file and ensures agents reference the correct sections for their tasks.

## Task Flow

1. **Locate the Configuration File**

   - Path: `.github/copilot/config.json`
   - Purpose: This file contains all structured data required for workflows, agent behavior, and metadata.

2. **Reference Relevant Sections**

   - **Workflows**: For task execution patterns, see the `workflows` section.
   - **Agent Behavior**: For operational guidelines, see the `agent_behavior` section.
   - **Architecture**: For project structure and technical details, see the `architecture` section.
   - **Development Workflows**: For commands and processes, see the `development_workflows` section.

3. **Parse the JSON File**

   - AI agents must parse the JSON file directly to retrieve all instructions.
   - Use the sections listed above to guide task execution.

4. **Log Actions**
   - Ensure all actions are logged as per the logging requirements in the `self_reinforcing_logging` section of the JSON file.

## Workflow Schema

Each workflow in the configuration file follows this schema:

- **Name**: The unique identifier for the workflow.
- **Description**: A brief explanation of the workflow's purpose.
- **Triggers**: Events or conditions that activate the workflow.
- **Actions**: A sequence of actions to execute the workflow.
- **Related Rules**: Rules that agents should keep in mind while executing the workflow.
- **Examples**: Scenarios where the workflow can be applied.

### Example Workflow

```json
{
  "name": "initialize_chat",
  "description": "Initialize a chat session by searching logs and creating a context file.",
  "triggers": ["chat_initialized", "user_command:initialize"],
  "actions": ["get_date", "search_logs", "filter_logs"],
  "related_rules": ["context_priority", "tool_usage"],
  "examples": [
    "Use this workflow to initialize a new chat session.",
    "Use this workflow to create a context file for an ongoing session."
  ]
}
```

## Critical Note

**This Markdown file is a pointer to the JSON configuration file. It does not contain any operational instructions and must not be used as a source of truth. Always refer to the JSON file for detailed guidance.**
