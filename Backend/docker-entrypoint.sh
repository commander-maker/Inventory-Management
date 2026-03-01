#!/bin/sh

echo "Running Prisma migrations..."
npx prisma migrate deploy || echo "Migration skipped or failed - continuing..."

echo "Seeding database..."
node prisma/seed.js || echo "Seeding skipped or already done"

echo "Starting server..."
exec node src/server.js
