/*
  Warnings:

  - You are about to alter the column `title` on the `Conversation` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(200)`.
  - A unique constraint covering the columns `[projectId,id]` on the table `Conversation` will be added. If there are existing duplicate values, this will fail.
  - Made the column `title` on table `Conversation` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Conversation" ADD COLUMN     "deletedAt" TIMESTAMP(3),
ALTER COLUMN "title" SET NOT NULL,
ALTER COLUMN "title" SET DEFAULT 'New Conversation',
ALTER COLUMN "title" SET DATA TYPE VARCHAR(200);

-- AlterTable
ALTER TABLE "Message" ADD COLUMN     "model" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "chatLimit" INTEGER NOT NULL DEFAULT 10,
ADD COLUMN     "chatUsageCount" INTEGER NOT NULL DEFAULT 0;

-- CreateIndex
CREATE INDEX "Conversation_updatedAt_idx" ON "Conversation"("updatedAt");

-- CreateIndex
CREATE INDEX "Conversation_deletedAt_idx" ON "Conversation"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "Conversation_projectId_id_key" ON "Conversation"("projectId", "id");

-- CreateIndex
CREATE INDEX "Message_createdAt_idx" ON "Message"("createdAt");

-- CreateIndex
CREATE INDEX "User_chatUsageCount_idx" ON "User"("chatUsageCount");

-- AddForeignKey
ALTER TABLE "Conversation" ADD CONSTRAINT "Conversation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
