#!/usr/bin/env python3
"""
Run the copilot index generator and cache outputs for local agents.
This script is intentionally independent of git and writes to
`.github/copilot/runtime/` so agents can refresh their local cache.
"""
import os
import sys
import subprocess
from datetime import datetime

ROOT = os.path.realpath(os.path.join(os.path.dirname(__file__), '..', '..', '..'))
OUT_RUNTIME = os.path.join(ROOT, '.github', 'copilot', 'runtime')
os.makedirs(OUT_RUNTIME, exist_ok=True)

def run_generator():
    script = os.path.join(os.path.dirname(__file__), 'generate-thread-index.py')
    # Prefer repository-scoped venv if present
    # detect common venv paths (Unix and Windows)
    venv_unix = os.path.realpath(os.path.join(os.path.dirname(__file__), '..', '.venv', 'bin', 'python'))
    venv_win = os.path.realpath(os.path.join(os.path.dirname(__file__), '..', '.venv', 'Scripts', 'python.exe'))
    if os.path.exists(venv_unix):
        python_exec = venv_unix
    elif os.path.exists(venv_win):
        python_exec = venv_win
    else:
        python_exec = sys.executable
    cmd = [python_exec, script, '--export-map', '--out-dir', OUT_RUNTIME, ROOT]
    print('Running:', ' '.join(cmd))
    res = subprocess.run(cmd, capture_output=True, text=True)
    print(res.stdout)
    if res.returncode != 0:
        print('Generator failed:', res.stderr, file=sys.stderr)
        return False
    # touch a timestamp for agents to see
    stamp = os.path.join(OUT_RUNTIME, 'last_refreshed.txt')
    with open(stamp, 'w') as f:
        f.write('refreshed_at: ' + datetime.utcnow().isoformat() + 'Z')
    return True

if __name__ == '__main__':
    ok = run_generator()
    if not ok:
        sys.exit(2)
    print('Agent runtime cache updated at', OUT_RUNTIME)
