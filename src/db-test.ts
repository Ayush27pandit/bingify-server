import { PrismaClient } from "@prisma/client";


const prisma = new PrismaClient();

async function main() {
    const room = await prisma.room.create({
        data: {
            roomCode: "ROOM123",
            joinToken: "join-abc",
            hostToken: "host-xyz",
            passwordHash: "hashed_password",
            movieUrl: null,
            videoStartTime: null,
        },
    });
    console.log(room);
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });