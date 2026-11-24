#!/usr/bin/env bash
# Install one release on this web server and switch to it.
#
#   sudo deploy/release.sh icumbi-release.tgz
#
# If the new release does not pass its health check within 30 seconds, the
# previous release is put back and the script exits 1.
set -euo pipefail

if [ "$(id -u)" -ne 0 ]; then echo "Run with sudo." >&2; exit 1; fi
if [ $# -ne 1 ] || [ ! -f "$1" ]; then echo "Usage: sudo $0 <release tarball>" >&2; exit 1; fi

ROOT=/opt/icumbi
HEALTH=http://127.0.0.1:3000/api/health
new="$ROOT/releases/$(date -u +%Y%m%d%H%M%S)"

mkdir -p "$new"
tar -xzf "$1" -C "$new"
chmod -R a+rX "$new"
if [ ! -f "$new/server.js" ]; then
  rm -rf "$new"
  echo "This archive has no server.js; nothing was changed." >&2
  exit 1
fi

previous=$(readlink "$ROOT/current" 2>/dev/null || true)
ln -sfn "$new" "$ROOT/current"
systemctl restart icumbi

healthy=no
for _ in $(seq 30); do
  if curl -fsS -m 2 -o /dev/null "$HEALTH"; then healthy=yes; break; fi
  sleep 1
done

if [ "$healthy" != yes ]; then
  echo "The new release failed its health check." >&2
  if [ -n "$previous" ] && [ -d "$previous" ]; then
    ln -sfn "$previous" "$ROOT/current"
    systemctl restart icumbi
    echo "Put back the previous release: $previous" >&2
  else
    systemctl stop icumbi
    rm -f "$ROOT/current"
  fi
  rm -rf "$new"
  exit 1
fi

# Keep the three newest releases (the live one is always among them).
find "$ROOT/releases" -mindepth 1 -maxdepth 1 -type d | sort -r | tail -n +4 | while read -r old; do
  rm -rf "$old"
done

echo "Live: $new"
