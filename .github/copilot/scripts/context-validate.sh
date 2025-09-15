#!/usr/bin/env bash
# POSIX-compatible wrapper for context-validate.py
set -euo pipefail

SCRIPT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
PY="$SCRIPT_DIR/context-validate.py"

if [ ! -f "$PY" ]; then
  echo "Missing $PY" >&2
  exit 2
fi

if [ "$#" -eq 0 ]; then
  echo "Usage: context-validate.sh <context-file> [<context-file> ...]" >&2
  exit 2
fi

EXIT_CODE=0
for f in "$@"; do
  if [ ! -f "$f" ]; then
    echo "File not found: $f" >&2
    EXIT_CODE=2
    continue
  fi
  python3 "$PY" "$f" "$(git rev-parse --show-toplevel)" || EXIT_CODE=$?
done

exit $EXIT_CODE
