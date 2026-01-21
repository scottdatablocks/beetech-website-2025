#!/usr/bin/env bash
set -euo pipefail

rm -rf dist
mkdir -p dist

# Copy only what should be served
cp -R index.html legal FlowPointLogoHD.png _routes.json dist/

# If you have other public pages, add them explicitly:
# cp -R services.html flowpoint-procurement.html assets dist/

# Optional: ensure no stray files get deployed
# (by not copying them)
