#!/bin/bash
# Script to apply migrations to production database
# Usage: DATABASE_URL="your_url" ./scripts/apply-migration.sh

set -e

echo "🔄 Applying Prisma migrations to production database..."

if [ -z "$DATABASE_URL" ]; then
  echo "❌ ERROR: DATABASE_URL environment variable is not set"
  echo "Usage: DATABASE_URL='postgresql://...' ./scripts/apply-migration.sh"
  exit 1
fi

echo "📊 Database: ${DATABASE_URL:0:30}..."

# Apply migrations
pnpm prisma migrate deploy

echo "✅ Migrations applied successfully!"
echo "🔄 Generating Prisma Client..."

pnpm prisma generate

echo "✅ All done!"

