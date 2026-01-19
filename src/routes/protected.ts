import express from "express";
import { authenticate } from "../middleware/auth";
import { createRoom } from "../controller/room-controller";
const router = express.Router();

router.get("/lobby", authenticate, (req, res) => {
    res.json({ message: "Lobby", user: req.user });
})


router.post('/create-room', authenticate, createRoom)

export default router