/*
  Warnings:

  - You are about to drop the column `videoStartTime` on the `Room` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "PlaybackState" AS ENUM ('PLAYING', 'PAUSED');

-- AlterTable
ALTER TABLE "Room" DROP COLUMN "videoStartTime",
ADD COLUMN     "playbackOffset" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "playbackState" "PlaybackState" NOT NULL DEFAULT 'PAUSED',
ADD COLUMN     "serverStartTime" TIMESTAMP(3);
