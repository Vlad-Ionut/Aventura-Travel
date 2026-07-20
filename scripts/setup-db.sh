#!/bin/bash
# Creează user + DB PostgreSQL pentru Aventura Travel
set -e
sudo -u postgres psql -c "DO \$\$ BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname='vlad1') THEN
    CREATE USER vlad1 WITH PASSWORD 'vlad1' SUPERUSER;
  END IF;
END \$\$;"
sudo -u postgres psql -c "SELECT 1 FROM pg_database WHERE datname='aventuratravel'" | grep -q 1 \
  || sudo -u postgres psql -c "CREATE DATABASE aventuratravel OWNER vlad1;"
echo "DB gata. Rulează: npm run db:init"
