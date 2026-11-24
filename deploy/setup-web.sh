#!/usr/bin/env bash
# One-time setup of a web server for icumbi. Safe to run again.
#
#   sudo deploy/setup-web.sh <site-host>
#   e.g. sudo deploy/setup-web.sh icumbi.ndungutsecharles.tech
#
# It adds swap, installs Node.js, creates the service user and folders,
# installs the systemd service and adds an nginx site for <site-host>.
# It never builds the app and never edits the default nginx site.
set -euo pipefail

NODE_VERSION=24.22.3   # Node.js 24 LTS; Next.js 16 needs 20.9 or newer.

if [ "$(id -u)" -ne 0 ]; then echo "Run with sudo." >&2; exit 1; fi
if [ $# -ne 1 ]; then echo "Usage: sudo $0 <site-host>" >&2; exit 1; fi
SITE_HOST=$1
if ! [[ $SITE_HOST =~ ^[A-Za-z0-9.-]+$ ]]; then echo "Bad site host: $SITE_HOST" >&2; exit 1; fi

HERE=$(cd "$(dirname "$0")" && pwd)

echo "== Swap"
# The server has no swap by default; 1 GB gives room if memory spikes.
if [ -z "$(swapon --show --noheadings)" ]; then
  fallocate -l 1G /swapfile
  chmod 600 /swapfile
  mkswap /swapfile >/dev/null
  swapon /swapfile
  grep -q '^/swapfile ' /etc/fstab || echo '/swapfile none swap sw 0 0' >> /etc/fstab
  echo "added a 1 GB swap file"
else
  echo "swap already on"
fi

echo "== Node.js $NODE_VERSION"
if [ ! -x /opt/node/bin/node ] || [ "$(/opt/node/bin/node -v)" != "v$NODE_VERSION" ]; then
  archive="node-v$NODE_VERSION-linux-x64.tar.gz"
  work=$(mktemp -d)
  curl -fsSL -o "$work/$archive" "https://nodejs.org/dist/v$NODE_VERSION/$archive"
  curl -fsSL -o "$work/SHASUMS256.txt" "https://nodejs.org/dist/v$NODE_VERSION/SHASUMS256.txt"
  # Stop if the download does not match the checksum Node.js published.
  (cd "$work" && grep " $archive\$" SHASUMS256.txt | sha256sum -c -)
  rm -rf /opt/node
  mkdir -p /opt/node
  tar -xzf "$work/$archive" -C /opt/node --strip-components=1
  rm -rf "$work"
fi
/opt/node/bin/node -v

echo "== User and folders"
id icumbi >/dev/null 2>&1 || useradd --system --no-create-home --shell /usr/sbin/nologin icumbi
mkdir -p /opt/icumbi/releases /var/lib/icumbi /etc/icumbi
chown icumbi:icumbi /var/lib/icumbi
if [ ! -f /etc/icumbi/icumbi.env ]; then
  install -m 600 "$HERE/icumbi.env.template" /etc/icumbi/icumbi.env
  echo "created /etc/icumbi/icumbi.env (add GEOAPIFY_KEY there)"
fi

echo "== Service"
install -m 644 "$HERE/icumbi.service" /etc/systemd/system/icumbi.service
systemctl daemon-reload
systemctl enable icumbi >/dev/null 2>&1
echo "service installed; deploy/release.sh starts it"

echo "== nginx site for $SITE_HOST"
sed "s/SITE_HOST/$SITE_HOST/g" "$HERE/nginx-icumbi.conf" > /etc/nginx/sites-available/icumbi
ln -sfn /etc/nginx/sites-available/icumbi /etc/nginx/sites-enabled/icumbi
if nginx -t; then
  systemctl reload nginx
else
  # Never leave nginx with a configuration it cannot load.
  rm -f /etc/nginx/sites-enabled/icumbi
  echo "nginx rejected the new site; it was not enabled." >&2
  exit 1
fi

echo "Done. Next: sudo deploy/release.sh icumbi-release.tgz"
