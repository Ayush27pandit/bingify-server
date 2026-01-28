import { addMemberToRoomInDB } from './addMemberToRoomInDB.js';
import { removeMemberFromRoomInDB } from './removeMemberFromRoomInDB.js';
import prisma from '../../lib/db.js';

// Maximum number of users allowed in a room (including host)
const MAX_ROOM_MEMBERS = 3;

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

      // Fetch room details including current member count
      const room = await prisma.room.findUnique({
        where: { roomId },
        select: {
          id: true,
          joinToken: true,
          hostToken: true,
          members: {
            select: { id: true, name: true, picture: true }
          }
        }
      });

      if (!room) {
        if (typeof callback === 'function') {
          callback({ success: false, error: `Room ${roomId} not found` });
        }
        return;
      }

      // if user is already in the room (allow reconnection)
      const isAlreadyMember = room.members.some(member => member.id === userId);

      // check room capacity (only if not already a member)
      if (!isAlreadyMember && room.members.length >= MAX_ROOM_MEMBERS) {
        if (typeof callback === 'function') {
          callback({ success: false, error: `Room is full (max ${MAX_ROOM_MEMBERS} participants)` });
        }
        return;
      }


      socket.join(roomId);



      // If user provided a hostToken, verify it matches before saving
      const userHostToken = hostToken === room.hostToken ? room.hostToken : null;

      // Add user to room members in db with tokens
      await addMemberToRoomInDB(socket.user, roomId, {
        joinToken: room.joinToken,
        hostToken: userHostToken // Will explicitly set to null if not host
      });

      // 3. Confirm success back to the frontend (the callback)
      if (typeof callback === 'function') {
        callback({ success: true });
      }

      // Fetch latest room details including all members (including the one just added)
      const updatedRoom = await prisma.room.findUnique({
        where: { roomId },
        select: {
          members: {
            select: { id: true, name: true, picture: true }
          }
        }
      });

      // Notify other people already in the room (only if newly joined)
      if (!isAlreadyMember) {
        socket.to(roomId).emit('user-joined', {
          userId: userId,
          userName: socket.user.name,
          userPicture: socket.user.picture,
          message: 'A new friend joined the party!',
        });
      }

      // 4. Send current playback state to the new member
      const roomState = await prisma.room.findUnique({
        where: { roomId },
        select: {
          playbackState: true,
          playbackOffset: true,
          serverStartTime: true
        }
      });

      if (roomState) {
        socket.emit('playback-state', {
          state: roomState.playbackState,
          offset: roomState.playbackOffset,
          serverStartTime: roomState.serverStartTime ? roomState.serverStartTime.toISOString() : null
        });
      }

      // 5. Send current members to the new member
      if (updatedRoom) {
        socket.emit('room-members', updatedRoom.members);
      }

      console.log(`Socket ${userId} joined room ${roomId}`);

      // Handle disconnect for this specific socket to clean up DB
      socket.on('disconnect', async () => {
        console.log(`User ${userId} disconnected, removing from room ${roomId} in DB`);
        await removeMemberFromRoomInDB(userId);

        // Notify others that user left
        io.to(roomId).emit('user-left', {
          userId: userId,
          userName: socket.user.name
        });
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

      socket.to(roomId).emit('user-left', {
        userId: userId,
        userName: socket.user.name
      });

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
