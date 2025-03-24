/*
  Warnings:

  - A unique constraint covering the columns `[name,serverId]` on the table `Channel` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `serverId` to the `Channel` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Channel_name_key";

-- AlterTable
ALTER TABLE "Channel" ADD COLUMN     "serverId" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "Server" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Server_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_UserServers" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_UserServers_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "Server_name_key" ON "Server"("name");

-- CreateIndex
CREATE INDEX "_UserServers_B_index" ON "_UserServers"("B");

-- CreateIndex
CREATE UNIQUE INDEX "Channel_name_serverId_key" ON "Channel"("name", "serverId");

-- AddForeignKey
ALTER TABLE "Channel" ADD CONSTRAINT "Channel_serverId_fkey" FOREIGN KEY ("serverId") REFERENCES "Server"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_UserServers" ADD CONSTRAINT "_UserServers_A_fkey" FOREIGN KEY ("A") REFERENCES "Server"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_UserServers" ADD CONSTRAINT "_UserServers_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
