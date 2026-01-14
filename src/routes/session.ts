import express from "express";
import admin from "../firebase-auth/firebaseAuth";

const router = express.Router();

router.post("/session", async (req, res) => {
    const header = req.headers.authorization;

    if (!header) {
        return res.status(401).json({ message: "No token" });
    }
    if (!header?.startsWith("Bearer ")) {
        return res.status(401).json({ message: "No token" });
    }

    const token = header.split(" ")[1];

    try {

        const decoded = await admin.auth().verifyIdToken(token);
        console.log(decoded);
        res.cookie("session", token, {
            httpOnly: true,
            secure: true,       // true in production
            sameSite: "strict",
        });
        res.json({ success: true });
    } catch (error) {
        console.log(error);
        return res.status(401).json({ message: "Unauthorized" });
    }



});

export default router;
