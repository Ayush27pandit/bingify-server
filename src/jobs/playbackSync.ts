import { Server } from 'socket.io';
import prisma from '../lib/db.js';

export function startPeriodicPlaybackSync(io: Server) {
    // Run every 5 seconds
    setInterval(async () => {
        try {
            // Fetch all active rooms that are currently playing
            const activeRooms = await prisma.room.findMany({
                where: {
                    isActive: true,
                    playbackState: 'PLAYING',
                },
                select: {
                    roomId: true,
                    playbackOffset: true,
                    serverStartTime: true,
                    playbackState: true,
                },
            });

            for (const room of activeRooms) {
                io.to(room.roomId).emit('playback-sync', {
                    state: room.playbackState,
                    offset: room.playbackOffset,
                    serverStartTime: room.serverStartTime ? room.serverStartTime.toISOString() : null,
                });
            }
        } catch (error) {
            console.error('Error in periodic playback sync:', error);
        }
    }, 5000);
}
