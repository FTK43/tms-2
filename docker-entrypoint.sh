#!/bin/sh
set -e

echo "Waiting for Postgres"
until pg_isready -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME"; do
  sleep 1
done

echo "running migrations..."
npm run migration:run:prod

echo "Seeding data..."
npm run seed:prod

echo "Starting app..."
exec "$@"