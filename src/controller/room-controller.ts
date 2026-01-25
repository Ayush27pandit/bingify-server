import { Request, Response } from 'express';
import crypto from 'crypto';
import { prisma } from '../lib/db.js';

export const createRoom = async (req: Request, res: Response) => {
  //when user create a room
  //-- add room details to db like pass and roomid using cryto and join token
  //-- send client room id and join token
  //-- create a room in socket.id

  const roomInfo = {
    roomId: crypto.randomBytes(4).toString('hex').toUpperCase(),
    joinToken: crypto.randomBytes(6).toString('hex'),
    password: crypto.randomInt(100000, 999999).toString(),
    createdAt: new Date(),
    hostToken: crypto.randomBytes(6).toString('hex'),
  };

  // add to db
  try {
    const room = await prisma.room.create({
      data: {
        roomId: roomInfo.roomId,
        joinToken: roomInfo.joinToken,
        passwordHashed: roomInfo.password,
        hostToken: roomInfo.hostToken,
        createdAt: roomInfo.createdAt,
      },
    });
    console.log('Room created:', room);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Internal server error during room creation' });
  }

  // send client room id and join token (using camelCase for frontend)
  res.status(201).json({
    roomId: roomInfo.roomId, // camelCase for frontend
    joinToken: roomInfo.joinToken,
    password: roomInfo.password,
    hostToken: roomInfo.hostToken,
    message: 'Room created successfully',
  });

  // create a room in socket.id
};

export const joinRoom = async (req: Request, res: Response) => {
  const { roomId, password } = req.body;

  if (!roomId || !password) {
    return res.status(400).json({ message: 'Room ID and password are required' });
  }

  try {
    const room = await prisma.room.findUnique({
      where: { roomId: roomId.toUpperCase() },
    });

    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    // Comparing plain text as per createRoom implementation
    if (room.passwordHashed !== password) {
      return res.status(401).json({ message: 'Invalid password' });
    }

    res.status(200).json({
      roomId: room.roomId,
      joinToken: room.joinToken,
      hostToken: null, // Guests should not receive the hostToken
      isActive: room.isActive,
      movieId: room.movieUrl, // Returning movieUrl as movieId
      message: 'Joined room successfully',
    });
  } catch (error) {
    console.error('Error joining room:', error);
    res.status(500).json({ message: 'Internal server error during room join' });
  }
};
