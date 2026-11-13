#!/bin/bash
cd "$(dirname "$0")"
PORT=8765
open "http://127.0.0.1:$PORT/" 2>/dev/null || true
python3 -m http.server "$PORT"
