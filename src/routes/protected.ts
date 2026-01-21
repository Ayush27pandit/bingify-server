import express from 'express';
import { authenticate } from '../middleware/auth';
import { createRoom } from '../controller/room-controller';
import { movieLibrary } from '../controller/movieLibrary-controller';
import { auth } from 'firebase-admin';
import { activeRoom } from '../controller/roomActive';
const router = express.Router();

router.get('/lobby', authenticate, (req, res) => {
  res.json({ message: 'Lobby', user: req.user });
});

router.post('/create-room', authenticate, createRoom);
router.get('/movie-library', authenticate, movieLibrary);
router.post('/active-room', authenticate, activeRoom);

export default router;
