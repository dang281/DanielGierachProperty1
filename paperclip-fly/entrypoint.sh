#!/bin/sh
set -e

CFG="$PAPERCLIP_HOME/instances/default/config.json"

if [ ! -f "$CFG" ]; then
  echo "[entrypoint] No instance data yet at $CFG."
  echo "[entrypoint] Sleeping so 'fly ssh sftp' can upload the tarball."
  exec sleep infinity
fi

echo "[entrypoint] Starting auth-proxy on port 8080."
node /app/auth-proxy.js &
PROXY_PID=$!
trap 'kill $PROXY_PID 2>/dev/null; exit 0' TERM INT

echo "[entrypoint] Starting Paperclip on 127.0.0.1:3100."
if paperclipai run -d "$PAPERCLIP_HOME" --instance default; then
  echo "[entrypoint] Paperclip exited cleanly."
else
  echo "[entrypoint] Paperclip failed with exit code $?. Falling back to sleep so config can be repaired via 'fly ssh console'."
  exec sleep infinity
fi
