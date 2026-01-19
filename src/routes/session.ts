import express from "express";
import admin from "../firebase-auth/firebaseAuth";
import prisma from "../lib/db";

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

    if (!token) {
        return res.status(401).json({ message: "Invalid token format" });
    }

    try {

        const decoded = await admin.auth().verifyIdToken(token);
        console.log(decoded);

        res.cookie("session", token, {
            httpOnly: true,
            secure: false,       // true in production
            sameSite: "strict",
        });
        //add user detail to db
        if (!decoded.email) {
            return res.status(400).json({ message: "Email is required" });
        }

        const user = await prisma.user.create({
            data: {
                name: decoded.name ?? "Anonymous",
                email: decoded.email,
                roomCode: null,
            }
        })
        res.json({ success: true });
    } catch (error) {
        console.log(error);
        return res.status(401).json({ message: "Unauthorized" });
    }



});

router.post("/logout", (req, res) => {
    res.clearCookie("session", {
        httpOnly: true,
        sameSite: "lax",
        secure: false, // true in prod
    });

    res.json({ success: true });
});

export default router;
