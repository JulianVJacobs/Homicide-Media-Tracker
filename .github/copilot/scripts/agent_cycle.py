#!/usr/bin/env python3
"""Agent cycle runner: prefer repository venv, run agent_refresh.py then log_summarizer.py,
and record start/end events using AgentLogger.
"""
import os
import sys
import subprocess
from pathlib import Path
import datetime

ROOT = Path(__file__).resolve().parents[1]
RUNTIME = ROOT / "runtime"
SCRIPTS = ROOT / "scripts"

def find_venv_python():
    candidates = [
        ROOT / ".venv" / "bin" / "python",
        ROOT / ".venv" / "Scripts" / "python.exe",
    ]
    for c in candidates:
        if c.exists():
            return str(c)
    return sys.executable

def run(cmd, env=None):
    print("Running:", " ".join(cmd))
    res = subprocess.run(cmd, env=env)
    return res.returncode

def main():
    python = find_venv_python()
    env = os.environ.copy()
    # prefer local venv PATH for subprocesses
    if python != sys.executable:
        venv_bin = str(Path(python).parent)
        env["PATH"] = venv_bin + os.pathsep + env.get("PATH", "")

    # Prepare runtime logs dir
    logs_dir = RUNTIME / "logs"
    logs_dir.mkdir(parents=True, exist_ok=True)

    # Log start using agent_logger
    try:
        from .agent_logger import AgentLogger
        logger = AgentLogger("agent-cycle")
        logger.log(session="agent-cycle", action="start", details={"ts": datetime.datetime.utcnow().isoformat() + "Z"})
    except Exception:
        pass

    # Run agent_refresh
    rc = run([python, str(SCRIPTS / "agent_refresh.py")])
    if rc != 0:
        print("agent_refresh.py failed with code", rc)

    # Run log_summarizer
    rc2 = run([python, str(SCRIPTS / "log_summarizer.py")])
    if rc2 != 0:
        print("log_summarizer.py failed with code", rc2)

    # Log end
    try:
        logger.log(session="agent-cycle", action="end", details={"rc_refresh": rc, "rc_summarizer": rc2, "ts": datetime.datetime.utcnow().isoformat() + "Z"})
    except Exception:
        pass

    return 0

if __name__ == "__main__":
    sys.exit(main())
