import { Request, Response } from 'express';
import prisma from '../lib/db.js';

export const activeRoom = async (req: Request, res: Response) => {
  //client request active room and server respond with active room details
  //roomid
  //also we need to add member in room members list
  // active status of room and it member are of same request
  const { roomId, movieId } = req.body;

  if (!roomId) {
    return res.status(400).json({ message: 'Room ID is required' });
  }
  try {
    //first we need to find room exists or not
    const roomExists = await prisma.room.findUnique({
      where: { roomId: roomId },
    });
    if (!roomExists) {
      return res.status(404).json({ message: 'Room not found' });
    }

    const room = await prisma.room.update({
      where: { roomId: roomId },
      data: {
        isActive: true,
        movieUrl: movieId || roomExists.movieUrl // Store movieId in movieUrl field
      },
    });
    return res.status(200).json({ message: 'Room activated', room });
  } catch (err) {
    console.log('Error activating room', err);
    return res.status(500).json({ message: 'Error activating room' });
  }
};
