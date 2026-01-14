import express from "express";
import { authenticate } from "../middleware/auth";
const router = express.Router();

router.get("/lobby", authenticate, (req, res) => {
    res.json({ message: "Lobby", user: req.user });
})

export default router