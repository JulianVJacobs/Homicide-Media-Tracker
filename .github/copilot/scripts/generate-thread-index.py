#!/usr/bin/env python3
"""
Generate a machine-friendly thread index and sessions index for agent use.

Outputs:
- .github/copilot/thread-relationships.json (machine copy of YAML mapping)
- .github/copilot/index.json (sessions + thread graph + recommended expansions)

Usage: python3 scripts/generate-thread-index.py [repo-root]
"""
import os
import sys
import json
import glob
import argparse
try:
    import yaml
except Exception:
    yaml = None
import re

def load_thread_relationships(repo_root):
    # Prefer explicit copilot-contained mapping files first (thread-map.json),
    # then legacy thread-relationships files. If none exist, caller may elect
    # to infer relationships from session contexts.
    candidates = [
        os.path.join(repo_root, '.github', 'copilot', 'contexts', 'thread-map.json'),
        os.path.join(repo_root, '.github', 'copilot', 'contexts', 'thread-relationships.json'),
        os.path.join(repo_root, '.github', 'copilot', 'contexts', 'thread-relationships.yaml'),
        os.path.join(repo_root, '.github', 'contexts', 'thread-relationships.json'),
        os.path.join(repo_root, '.github', 'contexts', 'thread-relationships.yaml'),
    ]
    for path in candidates:
        if not os.path.exists(path):
            continue
        try:
            if path.endswith('.json'):
                with open(path, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                # Accept either top-level mapping or wrapper with thread_relationships key
                if 'thread_relationships' in data:
                    return data['thread_relationships']
                # maybe the JSON already contains the mapping under 'threads' names
                if 'threads' in data:
                    # convert threads -> mapping of name -> edges list; keep as-is for generator
                    # Attempt to normalise back to thread_relationships simple mapping when possible
                    mapping = {}
                    for k, v in data['threads'].items():
                        rels = {}
                        # try to reconstruct lists from edges
                        for edge in v.get('edges', []):
                            rel_type = edge.get('type')
                            to = edge.get('to') or edge.get('name')
                            if rel_type and to:
                                rels.setdefault(rel_type, []).append(to)
                        mapping[k] = rels
                    if mapping:
                        return mapping
                    return {}
                else:
                    with open(path, 'r', encoding='utf-8') as f:
                        text = f.read()
                    if yaml:
                        try:
                            data = yaml.safe_load(text) or {}
                        except Exception:
                            data = {}
                    else:
                        # very small YAML fallback parser for simple mappings
                        data = {}
                        current = None
                        for line in text.splitlines():
                            if re.match(r'^\s*#', line):
                                continue
                            m = re.match(r'^([A-Za-z0-9_\-]+):\s*$', line)
                            if m:
                                current = m.group(1)
                                data[current] = {}
                                continue
                            m2 = re.match(r'^\s*([A-Za-z0-9_\-]+):\s*(.+)$', line)
                            if m2 and current:
                                key = m2.group(1)
                                val = m2.group(2).strip()
                                # try to parse simple JSON-like lists
                                if val.startswith('[') and val.endswith(']'):
                                    try:
                                        data[current][key] = json.loads(val.replace("'", '"'))
                                    except Exception:
                                        data[current][key] = [v.strip() for v in val.strip('[]').split(',') if v.strip()]
                                else:
                                    data[current][key] = val
                                continue
                            m3 = re.match(r'^\s*-\s*(.+)$', line)
                            if m3 and current:
                                items = data[current].setdefault('items', [])
                                items.append(m3.group(1).strip())
                    if not data:
                        continue
                    return data.get('thread_relationships', {})
        except Exception:
            continue
    return {}


def infer_thread_relationships_from_sessions(sessions):
    # sessions: list of dicts with keys 'primary_thread' and 'related_threads'
    # Build co-occurrence counts and a simple proportion-based relationship mapping.
    from collections import defaultdict
    counts = defaultdict(int)
    co = defaultdict(lambda: defaultdict(int))
    co_examples = defaultdict(lambda: defaultdict(list))

    # Normalise threads per session: collect primary + related; if none, try to infer from path
    for s in sessions:
        threads = []
        if s.get('primary_thread'):
            threads.append(s['primary_thread'])
        if s.get('related_threads'):
            for r in s.get('related_threads'):
                if r and r not in threads:
                    threads.append(r)
        # fallback: infer candidate from filename
        if not threads and s.get('path'):
            name = os.path.splitext(os.path.basename(s['path']))[0]
            # split on non-alnum, join with hyphen to make a readable token
            candidate = re.sub(r'[^0-9A-Za-z]+', '-', name).strip('-')
            if candidate:
                threads.append(candidate)

        # deduplicate
        threads = list(dict.fromkeys([t for t in threads if t]))
        for t in threads:
            counts[t] += 1
        for i, a in enumerate(threads):
            for b in threads[i+1:]:
                co[a][b] += 1
                co[b][a] += 1
                # record example session paths for provenance
                if s.get('path'):
                    if len(co_examples[a][b]) < 3:
                        co_examples[a][b].append(s.get('path'))
                    if len(co_examples[b][a]) < 3:
                        co_examples[b][a].append(s.get('path'))

    # Build relationship mapping
    relationships = {}
    inferred_details = {'threads': {}, 'total_sessions_considered': sum(counts.values())}
    for t in counts:
        rels = {'directly_related': [], 'often_related': [], 'occasionally_related': []}
        rels_detailed = {'directly_related': [], 'often_related': [], 'occasionally_related': []}
        for other, c in co[t].items():
            # proportion of t sessions that include other
            prop = c / counts[t] if counts[t] else 0
            entry = {'name': other, 'count': c, 'prop': prop, 'examples': co_examples[t].get(other, [])}
            if prop >= 0.6:
                rels['directly_related'].append(other)
                rels_detailed['directly_related'].append(entry)
            elif prop >= 0.3:
                rels['often_related'].append(other)
                rels_detailed['often_related'].append(entry)
            elif prop > 0:
                rels['occasionally_related'].append(other)
                rels_detailed['occasionally_related'].append(entry)
        relationships[t] = rels
        inferred_details['threads'][t] = {
            'count': counts[t],
            'relations': rels_detailed
        }
    return relationships, inferred_details

def parse_frontmatter(path):
    with open(path, 'r', encoding='utf-8') as f:
        text = f.read()
    fm = {}
    if text.startswith('---'):
        parts = text.split('---', 2)
        if len(parts) >= 3:
            try:
                fm = yaml.safe_load(parts[1]) or {}
            except Exception:
                fm = {}
    return fm, text

def parse_machine_block(text):
    m = re.search(r'<!--machine-json-start-->(.*?)<!--machine-json-end-->', text, re.S)
    if not m:
        return None
    try:
        return json.loads(m.group(1))
    except Exception:
        return None

def build_sessions(repo_root):
    sessions = []
    pattern = os.path.join(repo_root, '.github', 'copilot', 'contexts', '*.md')
    for path in glob.glob(pattern):
        fm, text = parse_frontmatter(path)
        machine = parse_machine_block(text)
        session_id = fm.get('session_id') or (machine and machine.get('session_id'))
        if not session_id:
            continue
        primary = (machine and machine.get('primary_thread')) or (fm.get('active_threads') and fm.get('active_threads')[0]) or (machine and machine.get('active_threads') and machine.get('active_threads')[0])
        related = (machine and machine.get('related_threads')) or fm.get('active_threads') or []
        sessions.append({
            'session_id': session_id,
            'path': os.path.relpath(path, repo_root),
            'primary_thread': primary,
            'related_threads': related,
            'status': fm.get('status') or (machine and machine.get('status')),
            'last_message_date': fm.get('last_message_date') or (machine and machine.get('last_message_date'))
        })
    return sessions

def recommend_expansion(thread, relationships):
    rec = []
    info = relationships.get(thread, {})
    if not info:
        return rec
    # include directly_related then often_related then occasionally_related
    for k in ('directly_related','often_related','occasionally_related'):
        vals = info.get(k) or []
        for v in vals:
            if v not in rec:
                rec.append(v)
    return rec

def build_thread_graph(relationships):
    threads = {}
    for t, info in relationships.items():
        edges = []
        for rel_type in ('directly_related','often_related','occasionally_related'):
            for to in (info.get(rel_type) or []):
                edges.append({'to': to, 'type': rel_type, 'weight': 1 if rel_type=='directly_related' else (0.6 if rel_type=='often_related' else 0.3)})
        threads[t] = {'name': t, 'edges': edges, 'recommended_expansion': recommend_expansion(t, relationships)}
    return threads

def main():
    parser = argparse.ArgumentParser(description='Generate copilot index and optional inferred thread map')
    parser.add_argument('--export-map', action='store_true', help='Write thread-map.inferred.json for review')
    parser.add_argument('--out-dir', default=None, help='Output directory (defaults to .github/copilot in repo root)')
    parser.add_argument('repo_root', nargs='?', default=None, help='Repository root (optional)')
    args = parser.parse_args()

    repo_root = args.repo_root if args.repo_root else os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..'))
    # Gather sessions first so we can infer threads if no map is provided
    sessions = build_sessions(repo_root)
    relationships = load_thread_relationships(repo_root)
    inferred_details = None
    inferred = False
    if not relationships:
        inferred = True
        relationships, inferred_details = infer_thread_relationships_from_sessions(sessions)
    threads = build_thread_graph(relationships)

    out_dir = args.out_dir if args.out_dir else os.path.join(repo_root, '.github', 'copilot')
    os.makedirs(out_dir, exist_ok=True)
    tr_json = os.path.join(out_dir, 'thread-relationships.json')
    idx_json = os.path.join(out_dir, 'index.json')

    # Write a single-file index containing sessions and the full threads graph.
    # Include metadata so consumers know if the threads were inferred or
    # came from an explicit map file.
    threads_source = 'committed_map' if os.path.exists(os.path.join(repo_root, '.github', 'copilot', 'contexts', 'thread-map.json')) else ('.github/contexts/thread-relationships.json' if os.path.exists(os.path.join(repo_root, '.github', 'contexts', 'thread-relationships.json')) else ('inferred_from_sessions' if inferred else 'unknown'))
    index_out = {
        'sessions': sessions,
        'threads': threads,
        'metadata': {
            'threads_source': threads_source,
            'generated_at': __import__('datetime').datetime.utcnow().isoformat() + 'Z',
            'generated_by': 'generate-thread-index.py'
        }
    }
    with open(idx_json, 'w', encoding='utf-8') as f:
        json.dump(index_out, f, indent=2)

    files_written = [os.path.relpath(idx_json, repo_root)]

    # Optionally write an inferred map for review
    if args.export_map and inferred_details:
        inferred_path = os.path.join(out_dir, 'thread-map.inferred.json')
        inferred_export = {
            'generated_at': __import__('datetime').datetime.utcnow().isoformat() + 'Z',
            'generated_by': 'generate-thread-index.py',
            'provenance': {
                'source_sessions_count': inferred_details.get('total_sessions_considered', 0)
            },
            'threads': inferred_details.get('threads', {})
        }
        with open(inferred_path, 'w', encoding='utf-8') as f:
            json.dump(inferred_export, f, indent=2)
        files_written.append(os.path.relpath(inferred_path, repo_root))

    # Remove the separate thread-relationships.json if it exists (we're now single-file)
    try:
        if os.path.exists(tr_json):
            os.remove(tr_json)
    except Exception:
        pass

    # Write a small last-run artifact for agents to consume
    last_run = {
        'generated_at': __import__('datetime').datetime.utcnow().isoformat() + 'Z',
        'generated_by': 'generate-thread-index.py',
        'threads_source': threads_source,
        'sessions_count': len(sessions),
        'threads_count': len(threads),
        'files_written': files_written
    }
    last_run_path = os.path.join(out_dir, 'last_run.json')
    try:
        with open(last_run_path, 'w', encoding='utf-8') as f:
            json.dump(last_run, f, indent=2)
        files_written.append(os.path.relpath(last_run_path, repo_root))
    except Exception:
        pass

    print(f'Wrote {idx_json} (embedded threads); files: {files_written}')

if __name__ == '__main__':
    main()
