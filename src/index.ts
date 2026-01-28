import express, { Request, Response } from 'express';
import protectedRoutes from './routes/protected.js';
import sessionRoutes from './routes/session.js';
import 'dotenv/config';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { fileURLToPath } from 'url';
import { startRoomCleanupJob } from './jobs/roomCleanUp.js';
import { uploadMovies } from './controller/seedMovies.js';
import { handleRoomJoin, handleRoomLeave } from './controller/rooms/handleRoomJoin.js';
import { handlePlaybackSync } from './controller/rooms/handlePlaybackSync.js';
import { startPeriodicPlaybackSync } from './jobs/playbackSync.js';
import { socketAuthMiddleware } from './firebase-auth/socket-auth.js';

// --------App and Server--------
const app = express();
const server = createServer(app);
const PORT = process.env.PORT ? Number(process.env.PORT) : 8000;
const FRONTEND_URL = process.env.FRONTEND_URL?.replace(/\/$/, '') as string;

//-------Middleware-------------
app.use(express.json());

app.use(
  cors({
    origin: FRONTEND_URL,
    credentials: true, // allow cookies
  }),
);


//-------Routes-----------------

app.get('/', (req: Request, res: Response) => {
  res.type('text/plain').send('Hello from Bingify Server \n');
});

app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', uptime: process.uptime() });
});

//protected routes
app.use('/protected', protectedRoutes);

//session routes
app.use('/auth', sessionRoutes);

//---cron-jobs-----
startRoomCleanupJob();

//-------Socket.io----------------

const io = new Server(server, {
  cors: {
    origin: FRONTEND_URL,
    credentials: true,
  },
});

io.use(socketAuthMiddleware);
io.on('connection', (socket) => {
  console.log(`User connected with socket id: ${socket.id}`);

  //handling joining room
  handleRoomJoin(io, socket);

  //handling leaving room
  handleRoomLeave(io, socket);

  //handling playback sync
  handlePlaybackSync(io, socket);

  socket.on('disconnect', () => {
    console.log(`User disconnected with socket id: ${socket.id}`);
  });
});

// Start periodic sync job
startPeriodicPlaybackSync(io);

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  server.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
  });
}


export default app;
