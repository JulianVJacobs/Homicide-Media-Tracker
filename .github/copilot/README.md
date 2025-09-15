# Copilot tooling (venv + usage)

This folder contains scripts and small tooling used by local agents. It is
recommended to create a repository-scoped virtual environment to isolate
dependencies used by these scripts.

Recommended location: `.github/copilot/.venv`

Quick setup (run from repository root):

```bash
# create venv
python3 -m venv .github/copilot/.venv
# activate
. .github/copilot/.venv/bin/activate
# upgrade pip and install deps
pip install --upgrade pip
pip install -r .github/copilot/requirements.txt
# freeze the exact deps (optional)
pip freeze > .github/copilot/requirements.txt
deactivate
```

If your system reports `ensurepip` or `venv` missing, on Debian/Ubuntu you
can install the runtime support with:

```bash
sudo apt update && sudo apt install python3-venv
```

How scripts use the venv
- `agent_refresh.py` will prefer `.github/copilot/.venv/bin/python` when present
  so agents don't need to activate the venv manually. Running scripts via the
  venv interpreter is recommended for reproducible behavior.

If you want the Copilot auto-approve rules to allow invocations of the venv
interpreter, add a conservative allow-pattern for `.github/copilot/.venv/bin/python`.
Copilot agent runtime cache

- **Purpose**: provide a local, git-independent cache of generated agent artifacts.
- **Generator**: run `scripts/generate-thread-index.py` to produce `index.json` and optionally `thread-map.inferred.json`.
- **Agent refresh**: run `scripts/agent_refresh.py` to populate `.github/copilot/runtime/` with the latest generated outputs (agents can read from this directory).

Quick usage:

```bash
# regenerate into runtime cache
python3 .github/copilot/scripts/agent_refresh.py

# inspect runtime outputs
ls -la .github/copilot/runtime
cat .github/copilot/runtime/index.json
```

Notes:
- This flow is intentionally independent of git so agents can refresh locally without PRs.
- Human reviewers can still commit `thread-map.json` to `.github/copilot/contexts/` to override inference.
Copilot Tools and Contexts
-------------------------

This directory contains tools and context files used by agents and maintainers for session persistence, context retention, and cooperative workflows.

Structure
- `contexts/` - session context files. Each file is a Markdown document with YAML frontmatter (human-facing) and optionally a machine JSON block for reliable parsing.
- `scripts/` - helper scripts for validation and index generation.
- `context-schema.json` - machine schema for the minimal machine block and frontmatter fields.

Guides
- See `contexts/README.md` for context file conventions and examples.
- Use the scripts in `scripts/` to validate context files before committing.
