/*
  Warnings:

  - You are about to drop the column `roomid` on the `Room` table. All the data in the column will be lost.
  - You are about to drop the column `roomCode` on the `User` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[roomId]` on the table `Room` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `roomId` to the `Room` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_roomCode_fkey";

-- DropIndex
DROP INDEX "Room_roomid_key";

-- DropIndex
DROP INDEX "User_roomCode_key";

-- AlterTable
ALTER TABLE "Room" DROP COLUMN "roomid",
ADD COLUMN     "roomId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "roomCode",
ADD COLUMN     "roomId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Room_roomId_key" ON "Room"("roomId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE SET NULL ON UPDATE CASCADE;
