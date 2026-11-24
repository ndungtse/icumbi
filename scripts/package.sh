#!/usr/bin/env bash
# Build once and pack one release archive that runs with `node server.js`.
set -euo pipefail
cd "$(dirname "$0")/.."

npm run build
cp -r .next/static .next/standalone/.next/static
if [ -d public ]; then cp -r public .next/standalone/public; fi
tar -czf icumbi-release.tgz -C .next/standalone .
echo "Wrote icumbi-release.tgz"
