#!/bin/bash
# Apply Prisma migrations to sync database schema
echo "🔄 Applying Prisma migrations..."
npx prisma migrate deploy

# Check if migrations were successful
if [ $? -eq 0 ]; then
  echo "✅ Database migrations applied successfully!"
  
  # Run backfill SQL to ensure existing users have quota fields
  echo "🔧 Running backfill query to update existing users..."
  npx prisma db execute --stdin < ./prisma/backfill-quota.sql
  
  if [ $? -eq 0 ]; then
    echo "✅ Backfill completed successfully!"
  else
    echo "⚠️  Backfill encountered an issue (may be normal if columns already exist)"
  fi
else
  echo "❌ Migration failed!"
  exit 1
fi
