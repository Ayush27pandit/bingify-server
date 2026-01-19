import express, { Request, Response } from 'express';
import protectedRoutes from "./routes/protected";
import sessionRoutes from "./routes/session";
import 'dotenv/config';
import cors from "cors";
import { createServer } from 'http';
import { Server } from 'socket.io';


// --------App and Server--------
const app = express();
const server = createServer(app);
const PORT = process.env.PORT ? Number(process.env.PORT) : 8000;


//-------Middleware-------------
app.use(express.json());

app.use(cors({
  origin: "http://localhost:3000", // frontend URL
  credentials: true,               // allow cookies
}));




//-------Routes-----------------

app.get('/', (req: Request, res: Response) => {
  res.type('text/plain').send('Hello from Bingify Server \n');
});


app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', uptime: process.uptime() });
});

//protected routes
app.use("/protected", protectedRoutes);

//session routes
app.use("/auth", sessionRoutes);


//-------Socket.io----------------

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    credentials: true
  }
})

io.on("connection", (socket) => {
  console.log(`User connected with socket id: ${socket.id}`);

  socket.on("disconnect", () => {
    console.log(`User disconnected with socket id: ${socket.id}`);
  })
})

import { fileURLToPath } from 'url';

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}/`);
  });
}
//lets do it

export default app;