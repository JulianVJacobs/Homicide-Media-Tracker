"""Simple append-only JSON-lines logger for agent actions.

Usage:
  from agent_logger import AgentLogger
  logger = AgentLogger(agent_name='agent-A')
  logger.log(session='s-1', action='note', details={'msg':'did X'})
"""
import os
import json
from datetime import datetime
from typing import Optional, Dict, Any, List
import tempfile
import shutil

ROOT = os.path.realpath(os.path.join(os.path.dirname(__file__), '..', '..', '..'))
LOG_DIR = os.path.join(ROOT, '.github', 'copilot', 'runtime', 'logs')
os.makedirs(LOG_DIR, exist_ok=True)

class AgentLogger:
    def __init__(self, agent_name: str):
        self.agent_name = agent_name

    def _log_path(self) -> str:
        # per-day logfile
        name = datetime.utcnow().strftime('%Y-%m-%d') + '.log.jsonl'
        return os.path.join(LOG_DIR, name)

    def tail(self, n: int = 10) -> List[Dict[str, Any]]:
        """Return last `n` log entries from today's log."""
        path = self._log_path()
        if not os.path.exists(path):
            return []
        with open(path, 'r', encoding='utf-8') as f:
            lines = [l for l in f if l.strip()]
        lines = lines[-n:]
        out = []
        for l in lines:
            try:
                out.append(json.loads(l))
            except Exception:
                continue
        return out

    def log(self, session: Optional[str], action: str, details: Optional[Dict[str, Any]] = None, extra: Optional[Dict[str, Any]] = None) -> None:
        entry = {
            'ts': datetime.utcnow().isoformat() + 'Z',
            'agent': self.agent_name,
            'session': session,
            'action': action,
            'details': details or {},
            'extra': extra or {}
        }
        # Best-effort schema validation/normalization
        try:
            entry = self._validate_and_normalise(entry)
        except Exception:
            # If validation fails, still attempt to write the raw entry
            pass

        # atomic append: write to temp file then append to main file
        try:
            main_path = self._log_path()
            tmp_fd, tmp_path = tempfile.mkstemp(prefix='logtmp', dir=LOG_DIR)
            try:
                with os.fdopen(tmp_fd, 'w', encoding='utf-8') as tf:
                    tf.write(json.dumps(entry, ensure_ascii=False) + '\n')
                # append atomically by renaming into place using shutil
                with open(main_path, 'ab') as mf, open(tmp_path, 'rb') as tfb:
                    shutil.copyfileobj(tfb, mf)
            finally:
                if os.path.exists(tmp_path):
                    try:
                        os.remove(tmp_path)
                    except Exception:
                        pass
        except Exception:
            # best-effort logging: swallow errors so agents don't crash
            pass

    def _validate_and_normalise(self, entry: Dict[str, Any]) -> Dict[str, Any]:
        """Ensure required fields exist and have expected types. Return normalised entry.

        This is intentionally permissive: it will coerce simple values and fill defaults.
        """
        # ts: must be string (ISO); ensure exists
        if 'ts' not in entry or not isinstance(entry['ts'], str):
            entry['ts'] = datetime.utcnow().isoformat() + 'Z'
        # agent: must be non-empty string
        if 'agent' not in entry or not entry['agent']:
            entry['agent'] = 'unknown'
        # action: must be non-empty string
        if 'action' not in entry or not isinstance(entry['action'], str) or not entry['action']:
            entry['action'] = 'unknown'
        # session: allow None or string
        s = entry.get('session')
        if s is not None and not isinstance(s, str):
            entry['session'] = str(s)
        # details and extra: ensure dicts
        if 'details' not in entry or not isinstance(entry['details'], dict):
            entry['details'] = {'value': entry.get('details')}
        if 'extra' not in entry or not isinstance(entry['extra'], dict):
            entry['extra'] = {'value': entry.get('extra')}
        return entry
