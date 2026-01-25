import { addMemberToRoomInDB } from './addMemberToRoomInDB.js';
import { removeMemberFromRoomInDB } from './removeMemberFromRoomInDB.js';
import prisma from '../../lib/db.js';

export function handleRoomJoin(io: any, socket: any) {
  socket.on('join-room', async ({ roomId, hostToken }: any, callback: any) => {
    try {
      if (!socket.user) {
        if (typeof callback === 'function') {
          callback({ success: false, error: 'User not authenticated' });
        }
        return;
      }

      const userId = socket.user.id;
      // This groups the socket so that we can later say:
      // "send this message to everyone in roomId X"
      socket.join(roomId);
      // 2. Notify other people already in the room
      socket.to(roomId).emit('user-joined', {
        userId: userId,
        userName: socket.user.name,
        message: 'A new friend joined the party!',
      });

      // Fetch room details to get tokens
      const room = await prisma.room.findUnique({
        where: { roomId },
        select: { joinToken: true, hostToken: true }
      });

      if (!room) {
        throw new Error(`Room ${roomId} not found`);
      }

      // If user provided a hostToken, verify it matches before saving
      const userHostToken = hostToken === room.hostToken ? room.hostToken : null;

      //Add user to room members in db with tokens
      await addMemberToRoomInDB(socket.user, roomId, {
        joinToken: room.joinToken,
        hostToken: userHostToken // Will explicitly set to null if not host
      });
      // 3. Confirm success back to the frontend (the callback)
      if (typeof callback === 'function') {
        callback({ success: true });
      }
      console.log(`Socket ${userId} joined room ${roomId}`);

      // Handle disconnect for this specific socket to clean up DB
      socket.on('disconnect', async () => {
        console.log(`User ${userId} disconnected, removing from room ${roomId} in DB`);
        await removeMemberFromRoomInDB(userId);
      });
    } catch (error) {
      console.error('Error joining room:', error);
      if (typeof callback === 'function') {
        callback({ success: false, error: (error as Error).message || 'Failed to join room' });
      }
    }
  });
}

export function handleRoomLeave(io: any, socket: any) {
  socket.on('leave-room', async ({ roomId }: any, callback: any) => {
    try {
      if (!socket.user) {
        if (typeof callback === 'function') {
          callback({ success: false, error: 'User not authenticated' });
        }
        return;
      }

      const userId = socket.user.id;
      socket.leave(roomId);

      console.log(`User ${userId} left room ${roomId}`);

      // Remove from DB
      await removeMemberFromRoomInDB(userId);

      if (typeof callback === 'function') {
        callback({ success: true });
      }
    } catch (error) {
      if (typeof callback === 'function') {
        callback({ success: false, error: (error as Error).message || 'Failed to leave room' });
      }
    }
  });
}
