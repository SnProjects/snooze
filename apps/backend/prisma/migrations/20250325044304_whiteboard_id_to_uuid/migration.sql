/*
  Warnings:

  - The primary key for the `Whiteboard` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- AlterTable
ALTER TABLE "Whiteboard" DROP CONSTRAINT "Whiteboard_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "Whiteboard_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Whiteboard_id_seq";
