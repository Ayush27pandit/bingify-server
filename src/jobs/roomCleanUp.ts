import crons from 'node-cron';
import prisma from '../lib/db.js';

const FORTY_EIGHT_HOURS_IN_MS = 48 * 60 * 60 * 1000;

async function deleteExpiredRooms() {
  const cutoff = new Date(Date.now() - FORTY_EIGHT_HOURS_IN_MS);
  try {
    const expiredRooms = await prisma.room.deleteMany({
      where: {
        OR: [
          {
            createdAt: { lt: cutoff },
          },
          {
            members: { none: {} },
          },
        ],
      },
    });

    if (expiredRooms.count > 0) {
      console.log(`Deleted ${expiredRooms.count} expired rooms`);
    } else {
      console.log('Cleanup ran: No expired rooms found');
    }
  } catch (error) {
    console.error('Error during room cleanup:', (error as Error).message || 'Unknown error');
  }
}

export function startRoomCleanupJob() {
  // 1. Run immediately on server start
  console.log('Performing initial room cleanup on startup...');
  deleteExpiredRooms();

  // 2. Schedule to run every 12 hours
  crons.schedule('0 */12 * * *', async () => {
    console.log('Running scheduled room cleanup job...');
    await deleteExpiredRooms();
  });

  console.log('Room cleanup job initialized (12-hour schedule)');
}
