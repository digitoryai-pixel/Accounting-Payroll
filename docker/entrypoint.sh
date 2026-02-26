#!/bin/sh
set -e

echo "==> Running database migrations..."
node dist/infrastructure/database/migrate.js

if [ "$RUN_SEED" = "true" ]; then
  echo "==> Seeding database..."
  node dist/infrastructure/database/seed.js
fi

echo "==> Starting application..."
exec node dist/index.js
