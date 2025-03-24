/*
  Warnings:

  - You are about to drop the `_UserServers` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `updatedAt` to the `Channel` table without a default value. This is not possible if the table is not empty.
  - Added the required column `serverId` to the `Message` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Message` table without a default value. This is not possible if the table is not empty.
  - Added the required column `username` to the `Message` table without a default value. This is not possible if the table is not empty.
  - Added the required column `creator` to the `Server` table without a default value. This is not possible if the table is not empty.
  - Added the required column `creatorId` to the `Server` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Server` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "_UserServers" DROP CONSTRAINT "_UserServers_A_fkey";

-- DropForeignKey
ALTER TABLE "_UserServers" DROP CONSTRAINT "_UserServers_B_fkey";

-- DropIndex
DROP INDEX "Channel_name_serverId_key";

-- DropIndex
DROP INDEX "Server_name_key";

-- AlterTable
ALTER TABLE "Channel" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Message" ADD COLUMN     "serverId" INTEGER NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "username" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Server" ADD COLUMN     "creator" TEXT NOT NULL,
ADD COLUMN     "creatorId" INTEGER NOT NULL,
ADD COLUMN     "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- DropTable
DROP TABLE "_UserServers";

-- CreateTable
CREATE TABLE "ServerMember" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "serverId" INTEGER NOT NULL,
    "role" TEXT DEFAULT 'Member',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ServerMember_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ServerMember" ADD CONSTRAINT "ServerMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServerMember" ADD CONSTRAINT "ServerMember_serverId_fkey" FOREIGN KEY ("serverId") REFERENCES "Server"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
