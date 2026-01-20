import crons from "node-cron";
import prisma from "../lib/db";

const FORTY_EIGHT_HOURS_IN_MS = 48 * 60 * 60 * 1000;

async function deleteExpiredRooms() {
    const cutoff = new Date(Date.now() - FORTY_EIGHT_HOURS_IN_MS);
    const expiredRooms = await prisma.room.deleteMany({
        where: {
            OR: [
                {
                    createdAt: { lt: cutoff }
                },
                {
                    members: { none: {} }
                }
            ]
        }
    })
    if (expiredRooms.count > 0) {
        console.log(`Deleted ${expiredRooms.count} expired rooms`);
    }
}

export function startRoomCleanupJob() {
    // Run every 12 hours
    crons.schedule("0 */12 * * *", async () => {
        console.log("Running room cleanup job...");
        await deleteExpiredRooms();
    });

    console.log("Room cleanup job started");
}
