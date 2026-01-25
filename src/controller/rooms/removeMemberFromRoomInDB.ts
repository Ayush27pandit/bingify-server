import prisma from '../../lib/db.js';

export const removeMemberFromRoomInDB = async (userId: string) => {
    try {
        // 1. Get the user's current room ID before disconnecting
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { roomId: true },
        });

        if (!user || !user.roomId) return;

        const internalRoomId = user.roomId;

        // 2. Disconnect the user and clear session tokens
        await prisma.user.update({
            where: { id: userId },
            data: {
                roomId: null,
                hostToken: null,
                joinToken: null
            },
        });
        console.log(`Member ${userId} removed from room ${internalRoomId} in DB`);

        // 3. Count remaining members in that room
        const memberCount = await prisma.user.count({
            where: { roomId: internalRoomId },
        });

        // 4. Final check and Delete with a 3-second delay to handle refreshes
        if (memberCount === 0) {
            console.log(`Room ${internalRoomId} is empty, waiting 3s before deletion...`);

            // Delay to allow for page refresh/reconnect
            await new Promise(resolve => setTimeout(resolve, 3000));

            // Small re-check to avoid race conditions during refreshes
            const finalCheck = await prisma.user.count({
                where: { roomId: internalRoomId },
            });

            if (finalCheck === 0) {
                const deleted = await prisma.room.deleteMany({
                    where: { id: internalRoomId },
                });
                if (deleted.count > 0) {
                    console.log(`Room ${internalRoomId} deleted successfully after grace period`);
                } else {
                    console.log(`Room ${internalRoomId} was already deleted by another process`);
                }
            } else {
                console.log(`Room ${internalRoomId} preserved: members re-joined during grace period`);
            }
        }
    } catch (error) {
        console.error('Error in removeMemberFromRoomInDB:', error);
    }
};
