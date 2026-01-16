-- Backfill quota fields for existing users that might not have them
-- Safe: uses COALESCE to preserve existing values
UPDATE "public"."User" 
SET 
  "chatLimit" = COALESCE("chatLimit", 10),
  "chatUsageCount" = COALESCE("chatUsageCount", 0)
WHERE "chatLimit" IS NULL OR "chatUsageCount" IS NULL;

-- Verify the update
SELECT COUNT(*) as total_users, 
       COUNT(CASE WHEN "chatLimit" IS NOT NULL THEN 1 END) as with_quota
FROM "public"."User";
