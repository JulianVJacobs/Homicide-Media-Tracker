#!/usr/bin/env bash
set -euo pipefail
SCRIPT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
PY="$SCRIPT_DIR/generate-thread-index.py"

if [ ! -f "$PY" ]; then
  echo "Missing $PY" >&2
  exit 2
fi

REPO_ROOT=$(git rev-parse --show-toplevel 2>/dev/null || echo "$(cd "$SCRIPT_DIR/.." && pwd)")
python3 "$PY" "$REPO_ROOT"
