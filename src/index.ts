import express, { Request, Response } from 'express';
import protectedRoutes from './routes/protected';
import sessionRoutes from './routes/session';
import 'dotenv/config';
import cors from "cors";

const app = express();
const PORT = process.env.PORT ? Number(process.env.PORT) : 8000;

app.use(
  cors({
    origin: "http://localhost:3000", // frontend URL
    credentials: true,               // allow cookies
  })
);


app.get('/', (req: Request, res: Response) => {
  res.type('text/plain').send('Hello from Express + TypeScript!\n');
});

// Example JSON route
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', uptime: process.uptime() });
});
app.use("/protected", protectedRoutes);
app.use("/auth", sessionRoutes);
export default app;

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}/`);
  });
}
