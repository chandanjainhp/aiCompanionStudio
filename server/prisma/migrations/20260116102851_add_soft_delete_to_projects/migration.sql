-- DropIndex (if exists)
DROP INDEX IF EXISTS "User_chatLimit_idx";

-- AlterTable
ALTER TABLE "Project" ADD COLUMN "deletedAt" TIMESTAMP(3),
ALTER COLUMN "model" SET DEFAULT 'gemini-2.0-flash';

-- CreateIndex
CREATE INDEX "Project_deletedAt_idx" ON "Project"("deletedAt");
