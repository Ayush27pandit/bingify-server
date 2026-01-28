import prisma from '../../lib/db.js';

export function handlePlaybackSync(io: any, socket: any) {
    socket.on('playback-play', async ({ roomId, offset }: { roomId: string; offset: number }) => {
        try {
            if (!socket.user) return;

            // Verify host
            const user = await prisma.user.findUnique({
                where: { id: socket.user.id },
                include: { room: true },
            });

            if (!user || user.room?.roomId !== roomId || !user.hostToken) {
                return; // Not host or not in this room
            }

            const now = new Date();

            // Update DB
            await prisma.room.update({
                where: { roomId },
                data: {
                    playbackState: 'PLAYING',
                    playbackOffset: offset,
                    serverStartTime: now,
                },
            });

            // Broadcast to everyone in the room
            io.to(roomId).emit('playback-state', {
                state: 'PLAYING',
                offset: offset,
                serverStartTime: now.toISOString(),
            });

            console.log(`Room ${roomId}: Play at ${offset}`);
        } catch (error) {
            console.error('Error in playback-play:', error);
        }
    });

    socket.on('playback-pause', async ({ roomId, offset }: { roomId: string; offset: number }) => {
        try {
            if (!socket.user) return;

            // Verify host
            const user = await prisma.user.findUnique({
                where: { id: socket.user.id },
                include: { room: true },
            });

            if (!user || user.room?.roomId !== roomId || !user.hostToken) {
                return;
            }

            // Update DB
            await prisma.room.update({
                where: { roomId },
                data: {
                    playbackState: 'PAUSED',
                    playbackOffset: offset,
                    serverStartTime: null,
                },
            });

            // Broadcast
            io.to(roomId).emit('playback-state', {
                state: 'PAUSED',
                offset: offset,
                serverStartTime: null,
            });

            console.log(`Room ${roomId}: Pause at ${offset}`);
        } catch (error) {
            console.error('Error in playback-pause:', error);
        }
    });

    socket.on('playback-seek', async ({ roomId, offset }: { roomId: string; offset: number }) => {
        try {
            if (!socket.user) return;

            // Verify host
            const user = await prisma.user.findUnique({
                where: { id: socket.user.id },
                include: { room: true },
            });

            if (!user || user.room?.roomId !== roomId || !user.hostToken) {
                return;
            }

            if (!user.room) return;
            const isPlaying = user.room.playbackState === 'PLAYING';
            const now = isPlaying ? new Date() : null;

            // Update DB
            await prisma.room.update({
                where: { roomId },
                data: {
                    playbackOffset: offset,
                    serverStartTime: now,
                },
            });

            // Broadcast
            io.to(roomId).emit('playback-state', {
                state: user.room.playbackState,
                offset: offset,
                serverStartTime: now ? now.toISOString() : null,
            });

            console.log(`Room ${roomId}: Seek to ${offset}`);
        } catch (error) {
            console.error('Error in playback-seek:', error);
        }
    });
}
