#!/bin/bash
# Pornire Aventura Travel (Linux/Mac)
cd "$(dirname "$0")/.."
set -e
echo "=== Branch corect ==="
git fetch origin
git checkout cursor/aventura-travel-features-80dc
echo "=== Dependințe ==="
npm install
echo "=== Baza de date ==="
npm run db:init || {
  echo "DB a eșuat. Rulează: bash scripts/setup-db.sh && npm run db:init"
  exit 1
}
echo "=== Server: http://localhost:8080 ==="
npm start
