#!/usr/bin/env bash
# Run the dashboard server locally.
# Set DASHBOARD_USER and DASHBOARD_PASS to override default admin/admin.
set -e
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
cd "$REPO_ROOT"
exec python3 -m uvicorn dashboard.server.app:app --host 0.0.0.0 --port "${PORT:-8000}" --reload
