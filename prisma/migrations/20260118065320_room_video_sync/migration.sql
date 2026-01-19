-- CreateTable
CREATE TABLE "Room" (
    "id" TEXT NOT NULL,
    "roomid" TEXT NOT NULL,
    "joinToken" TEXT NOT NULL,
    "passwordHashed" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "hostToken" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "videoStartTime" TIMESTAMP(3),
    "movieUrl" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Room_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "roomCode" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Room_roomid_key" ON "Room"("roomid");

-- CreateIndex
CREATE UNIQUE INDEX "Room_joinToken_key" ON "Room"("joinToken");

-- CreateIndex
CREATE UNIQUE INDEX "Room_hostToken_key" ON "Room"("hostToken");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_roomCode_key" ON "User"("roomCode");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_roomCode_fkey" FOREIGN KEY ("roomCode") REFERENCES "Room"("id") ON DELETE SET NULL ON UPDATE CASCADE;
