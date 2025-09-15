"""Agent runtime API: loader helpers to read cached index and metadata."""
import json
import os
from typing import Dict, Any, List, Optional

ROOT = os.path.realpath(os.path.join(os.path.dirname(__file__), '..', '..', '..'))
RUNTIME = os.path.join(ROOT, '.github', 'copilot', 'runtime')
INDEX_PATH = os.path.join(RUNTIME, 'index.json')
LAST_RUN = os.path.join(RUNTIME, 'last_run.json')

def _load_json(path: str) -> Optional[Dict[str, Any]]:
    try:
        with open(path, 'r', encoding='utf-8') as f:
            return json.load(f)
    except Exception:
        return None

def read_index() -> Dict[str, Any]:
    """Return the runtime index (sessions, threads, metadata)."""
    data = _load_json(INDEX_PATH) or {}
    return data

def read_last_run() -> Dict[str, Any]:
    """Return last_run metadata."""
    return _load_json(LAST_RUN) or {}

def list_threads() -> List[str]:
    idx = read_index()
    return list(idx.get('threads', {}).keys())

def get_thread(name: str) -> Optional[Dict[str, Any]]:
    idx = read_index()
    return idx.get('threads', {}).get(name)

def recommend_expansions(name: str) -> List[str]:
    t = get_thread(name)
    if not t:
        return []
    return t.get('recommended_expansion', [])

def get_sessions() -> List[Dict[str, Any]]:
    return read_index().get('sessions', [])


def read_logs(limit: int = 100) -> List[Dict[str, Any]]:
    """Return recent log entries across log files, newest first, up to `limit`."""
    logs = []
    try:
        files = [f for f in os.listdir(os.path.join(RUNTIME, 'logs')) if f.endswith('.jsonl')]
        files = sorted(files, reverse=True)
        for fname in files:
            path = os.path.join(RUNTIME, 'logs', fname)
            with open(path, 'r', encoding='utf-8') as f:
                for line in f:
                    line = line.strip()
                    if not line:
                        continue
                    try:
                        logs.append(json.loads(line))
                    except Exception:
                        continue
                    if len(logs) >= limit:
                        return logs
    except Exception:
        return logs
    return logs


def read_summary() -> Dict[str, Any]:
    summary_path = os.path.join(RUNTIME, 'logs', 'summary.json')
    try:
        with open(summary_path, 'r', encoding='utf-8') as f:
            return json.load(f)
    except Exception:
        return {}

if __name__ == '__main__':
    print('threads:', list_threads())
    print('last_run:', read_last_run())
