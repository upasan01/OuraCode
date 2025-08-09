import { Request, Response } from "express";
import Room from "../models/room.model.js";

export const joinRoom = async (req: Request, res: Response) => {
    try {
        const { roomId, username } = req.body

        if (!roomId || !username) {
            return res.status(400).json({
                message: "Enter Room Id and Username",
                code: 400
            })
        }

        const room = await Room.findOne({ roomId });

        if (!room) {
            return res.status(404).json({
                message: "Room not found",
                code: 404
            });
        }

        const userLimit = room.users.length
        // console.log(userLimit)
        const MAX_USER_LIMITS = 2

        if (userLimit === MAX_USER_LIMITS) {
            return res.status(403).json({
                message: "Maximum amount of users joined already",
                code: 403
            })
        }

        if (room.users.includes(username)) {
            return res.status(409).json({
                message: "Username already taken in this room",
                code: 409
            });
        }

        room.users.push(username);
        await room.save();

        return res.status(200).json({
            message: "Joined successfully",
            room
        });
    } catch (err) {
        return res.status(500).json({
            messgae: "Something went worng",
            //@ts-ignore
            error: err.message,
            code: 500
        })
    }
}