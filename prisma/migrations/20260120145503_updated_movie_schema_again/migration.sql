/*
  Warnings:

  - You are about to drop the column `muxId` on the `Movie` table. All the data in the column will be lost.
  - You are about to drop the column `thumbnail` on the `Movie` table. All the data in the column will be lost.
  - You are about to drop the column `videoUrl` on the `Movie` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[muxAssetId]` on the table `Movie` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[muxPlaybackId]` on the table `Movie` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `muxAssetId` to the `Movie` table without a default value. This is not possible if the table is not empty.
  - Added the required column `muxPlaybackId` to the `Movie` table without a default value. This is not possible if the table is not empty.
  - Added the required column `thumbnailUrl` to the `Movie` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Movie" DROP COLUMN "muxId",
DROP COLUMN "thumbnail",
DROP COLUMN "videoUrl",
ADD COLUMN     "muxAssetId" TEXT NOT NULL,
ADD COLUMN     "muxPlaybackId" TEXT NOT NULL,
ADD COLUMN     "thumbnailUrl" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Movie_muxAssetId_key" ON "Movie"("muxAssetId");

-- CreateIndex
CREATE UNIQUE INDEX "Movie_muxPlaybackId_key" ON "Movie"("muxPlaybackId");
