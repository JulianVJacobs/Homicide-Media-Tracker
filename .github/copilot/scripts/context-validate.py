#!/usr/bin/env python3
import sys
import os
import yaml
import json
import re
try:
    import jsonschema
except Exception:
    jsonschema = None

def load_frontmatter(path):
    with open(path, 'r', encoding='utf-8') as f:
        text = f.read()
    if not text.startswith('---'):
        return None
    parts = text.split('---', 2)
    if len(parts) < 3:
        return None
    fm_text = parts[1]
    try:
        return yaml.safe_load(fm_text)
    except Exception:
        return None

def validate_file(path, repo_root):
    fm = load_frontmatter(path)
    if fm is None:
        print(f"ERROR: no valid frontmatter in {path}")
        return 1
    session_id = fm.get('session_id')
    if session_id is None:
        print(f"ERROR: session_id missing in frontmatter of {path}")
        return 1
    filename = os.path.basename(path)
    if session_id not in filename:
        print(f"ERROR: session_id '{session_id}' not found in filename '{filename}'")
        return 1
    # check .copilot-chats presence
    chat_path = os.path.join(repo_root, '.copilot-chats', f"{session_id}.json")
    if not os.path.exists(chat_path):
        # allow strings that might be shortened or different, warn instead of fail
        print(f"WARNING: corresponding chat log not found at {chat_path}")
    # optional machine JSON block validation
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
    m = re.search(r'<!--machine-json-start-->(.*?)<!--machine-json-end-->', content, re.S)
    if m:
        block = m.group(1).strip()
        try:
            machine = json.loads(block)
            schema_path = os.path.join(repo_root, '.github', 'copilot', 'contexts', 'schema.json')
            if os.path.exists(schema_path) and jsonschema:
                with open(schema_path, 'r', encoding='utf-8') as sf:
                    schema = json.load(sf)
                try:
                    jsonschema.validate(machine, schema)
                    print(f"OK(machine): {path}")
                except Exception as e:
                    print(f"ERROR(machine): schema validation failed for {path}: {e}")
                    return 1
            # additional thread_relationships checks
            tr = machine.get('thread_relationships')
            if tr:
                allowed = {'directly_related', 'often_related', 'occasionally_related'}
                for k,v in tr.items():
                    if not isinstance(k, str):
                        print(f"ERROR(machine): thread_relationships key must be string in {path}")
                        return 1
                    if v not in allowed:
                        print(f"ERROR(machine): thread_relationships value '{v}' not allowed for key '{k}' in {path}")
                        return 1
            elif os.path.exists(schema_path):
                print("WARNING: jsonschema not available; skipping machine block validation")
            else:
                print("WARNING: schema file not found; skipping machine block validation")
        except Exception as e:
            print(f"ERROR: failed to parse machine JSON block in {path}: {e}")
            return 1
    else:
        print("NOTE: no machine JSON block found; frontmatter validated only")
    print(f"OK: {path}")
    return 0

def main():
    if len(sys.argv) < 2:
        print('Usage: context-validate.py <context-file> [repo-root]')
        return 2
    path = sys.argv[1]
    repo_root = sys.argv[2] if len(sys.argv) > 2 else os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
    rc = validate_file(path, repo_root)
    sys.exit(rc)

if __name__ == '__main__':
    main()
