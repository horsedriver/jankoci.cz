#!/bin/bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")" && pwd)"
PORT="${CYBERCORE_PORT:-8765}"
cd "$ROOT"
URL="http://127.0.0.1:${PORT}/index.html"
( sleep 1; open "$URL" ) &
echo "CyberCore editor: $URL"
echo "Stop server with Ctrl+C."
python3 -m http.server "$PORT" --bind 127.0.0.1
