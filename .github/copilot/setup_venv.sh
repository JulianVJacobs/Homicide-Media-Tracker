#!/usr/bin/env bash
set -euo pipefail

ROOT=$(cd "$(dirname "$0")/.." && pwd)
VENV="$ROOT/.venv"

echo "Creating venv at $VENV"
if ! python3 -m venv "$VENV"; then
  echo "python3 -m venv failed; attempting pip-installed virtualenv fallback"
  if python3 -m pip install --user virtualenv; then
    if ! python3 -m virtualenv "$VENV"; then
      echo "virtualenv fallback failed; please install python3-venv or virtualenv." >&2
      exit 3
    fi
  else
    echo "Failed to install virtualenv; please install python3-venv or virtualenv." >&2
    exit 2
  fi
fi

echo "Activating venv and installing requirements"
. "$VENV/bin/activate"
pip install --upgrade pip
if [ -f "$ROOT/requirements.txt" ]; then
  pip install -r "$ROOT/requirements.txt"
fi
pip freeze > "$ROOT/requirements.txt"
deactivate
echo "Venv setup complete"
