/*
  Warnings:

  - You are about to drop the column `channelId` on the `ServerMember` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "ServerMember" DROP CONSTRAINT "ServerMember_channelId_fkey";

-- AlterTable
ALTER TABLE "ServerMember" DROP COLUMN "channelId",
ADD COLUMN     "activeVcId" TEXT;

-- AddForeignKey
ALTER TABLE "ServerMember" ADD CONSTRAINT "ServerMember_activeVcId_fkey" FOREIGN KEY ("activeVcId") REFERENCES "Channel"("id") ON DELETE SET NULL ON UPDATE CASCADE;
