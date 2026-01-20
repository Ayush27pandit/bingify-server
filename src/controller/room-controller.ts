import { Request, Response } from "express";
import crypto from "crypto";
import { prisma } from "../lib/db";

export const createRoom = async (req: Request, res: Response) => {
    //when user create a room 
    //-- add room details to db like pass and roomid using cryto and join token
    //-- send client room id and join token
    //-- create a room in socket.id

    const roomInfo = {
        roomId: crypto.randomBytes(4).toString("hex").toUpperCase(),
        joinToken: crypto.randomBytes(6).toString("hex"),
        password: crypto.randomInt(100000, 999999).toString(),
        createdAt: new Date(),
        hostToken: crypto.randomBytes(6).toString("hex"),

    }

    // add to db
    try {
        const room = await prisma.room.create({
            data: {
                roomId: roomInfo.roomId,
                joinToken: roomInfo.joinToken,
                passwordHashed: roomInfo.password,
                hostToken: roomInfo.hostToken,
                createdAt: roomInfo.createdAt,
            }
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error during room creation" });
    }



    // send client room id and join token (using camelCase for frontend)
    res.status(201).json({
        roomId: roomInfo.roomId,  // camelCase for frontend
        joinToken: roomInfo.joinToken,
        password: roomInfo.password,
        hostToken: roomInfo.hostToken,
        message: "Room created successfully",
    })

    // create a room in socket.id

}
