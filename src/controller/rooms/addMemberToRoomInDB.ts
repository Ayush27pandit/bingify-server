import prisma from '../../lib/db.js';

export const addMemberToRoomInDB = async (
  user: { id: string; name: string; email: string },
  roomId: string,
  tokens?: { joinToken?: string | null; hostToken?: string | null }
) => {
  try {
    // Check if room exists first
    const room = await prisma.room.findUnique({
      where: { roomId: roomId },
    });

    if (!room) {
      throw new Error(`Room with id ${roomId} not found`);
    }

    // 1. Ensure User exists and is migrated (if needed)
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ id: user.id }, { email: user.email }],
      },
    });

    if (existingUser) {
      if (existingUser.id !== user.id) {
        // Migration: delete old record (cuid) and create new one (firebase uid)
        await prisma.user.delete({ where: { id: existingUser.id } });
        await prisma.user.create({
          data: {
            id: user.id,
            name: user.name,
            email: user.email,
            roomId: room.id, // Claim early during creation
            hostToken: tokens?.hostToken,
            joinToken: tokens?.joinToken,
          },
        });
        console.log(`Migrated user ${user.email} and connected to room early with tokens`);
      } else {
        // Just update name and claim room early
        await prisma.user.update({
          where: { id: user.id },
          data: {
            name: user.name,
            roomId: room.id, // Claim early
            hostToken: tokens?.hostToken,
            joinToken: tokens?.joinToken,
          },
        });
      }
    } else {
      // Create new user and claim room early
      await prisma.user.create({
        data: {
          id: user.id,
          name: user.name,
          email: user.email,
          roomId: room.id, // Claim early
          hostToken: tokens?.hostToken,
          joinToken: tokens?.joinToken,
        },
      });
    }

    console.log(`Member ${user.id} successfully connected to room ${room.roomId} (internal: ${room.id})`);
  } catch (error) {
    console.error('Error adding member to room:', error);
    throw error;
  }
};
