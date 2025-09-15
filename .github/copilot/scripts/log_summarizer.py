"""Read runtime logs and write a compact summary for agents to consume."""
import os
import json
from collections import defaultdict

ROOT = os.path.realpath(os.path.join(os.path.dirname(__file__), '..', '..', '..'))
LOG_DIR = os.path.join(ROOT, '.github', 'copilot', 'runtime', 'logs')
OUT_PATH = os.path.join(ROOT, '.github', 'copilot', 'runtime', 'logs', 'summary.json')

def summarize():
    if not os.path.isdir(LOG_DIR):
        print('no logs dir')
        return None
    summary = {
        'by_agent': {},
        'by_action': {},
        'total_entries': 0,
        'first_ts': None,
        'last_ts': None
    }
    by_agent = defaultdict(int)
    by_action = defaultdict(int)
    first_ts = None
    last_ts = None
    total = 0
    for fname in sorted(os.listdir(LOG_DIR)):
        if not fname.endswith('.jsonl'):
            continue
        path = os.path.join(LOG_DIR, fname)
        try:
            with open(path, 'r', encoding='utf-8') as f:
                for line in f:
                    line = line.strip()
                    if not line:
                        continue
                    try:
                        entry = json.loads(line)
                    except Exception:
                        continue
                    total += 1
                    agent = entry.get('agent') or 'unknown'
                    action = entry.get('action') or 'unknown'
                    ts = entry.get('ts')
                    by_agent[agent] += 1
                    by_action[action] += 1
                    if ts:
                        if first_ts is None or ts < first_ts:
                            first_ts = ts
                        if last_ts is None or ts > last_ts:
                            last_ts = ts
        except Exception:
            continue
    summary['by_agent'] = dict(by_agent)
    summary['by_action'] = dict(by_action)
    summary['total_entries'] = total
    summary['first_ts'] = first_ts
    summary['last_ts'] = last_ts
    try:
        # atomic write
        tmp = OUT_PATH + '.tmp'
        with open(tmp, 'w', encoding='utf-8') as f:
            json.dump(summary, f, indent=2)
        os.replace(tmp, OUT_PATH)
    except Exception:
        pass
    return summary

if __name__ == '__main__':
    s = summarize()
    print('summary:', s)
