import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { createRoom, joinRoom } from '../controller/room-controller.js';
import { movieLibrary } from '../controller/movieLibrary-controller.js';
import { auth } from 'firebase-admin';
import { activeRoom } from '../controller/roomActive.js';
const router = express.Router();

router.get('/lobby', authenticate, (req, res) => {
  res.json({ message: 'Lobby', user: req.user });
});

router.post('/create-room', authenticate, createRoom);
router.post('/join-room', authenticate, joinRoom);
router.get('/movie-library', authenticate, movieLibrary);
router.post('/activate-room', authenticate, activeRoom);

export default router;
