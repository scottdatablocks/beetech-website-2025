#!/usr/bin/env bash
set -euo pipefail
set -x

rm -rf dist
mkdir -p dist

# Copy only what should be served
cp -R index.html legal FlowPointLogoHD.png _routes.json dist/

echo "===== DIST CONTENTS ====="
ls -la dist
echo "===== DIST FILE TREE ====="
find dist -maxdepth 3 -type f -print
echo "===== ROUTES JSON (first 50 lines) ====="
sed -n '1,50p' dist/_routes.json || true
