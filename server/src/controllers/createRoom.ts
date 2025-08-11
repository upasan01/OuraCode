// route logic
import { Request, Response } from "express";
import Room from "../models/room.model.js";
import crypto from "crypto"
import { redis } from "../lib/redis.js";

export const createRoom = async (req: Request, res: Response) => {
    try {
        const { username, language, roomId } = req.body

        if (!username || !language) {
            return res.status(400).json({
                message: "Username and Language is required",
                code: 400
            })
        }

        const finalRoomId = roomId || crypto.randomBytes(4).toString("hex")

        const existingRoom = await Room.findOne({
            roomId: finalRoomId
        })

        if (existingRoom) {
            return res.status(409).json({
                message: "Room Id already exists",
                code: 409
            })
        }

        const room = await Room.create({
            roomId: finalRoomId,
            username: username,
            language: language,
            users: [username]
        })

        await redis.sadd(`room:${finalRoomId}:users`, username)
        await redis.set(`room:${finalRoomId}:language`, language)
        // expiretion will be enabled in prod
        /*await redis.expire(`room:${finalRoomId}:users`, 10)
        await redis.expire(`room:${finalRoomId}:language`, 10)*/

        return res.json({
            message: "Successfully room created",
            room
        })

    } catch (err) {
        return res.status(500).json({
            message: "Something went wrong",
            //@ts-ignore
            error: err.message,
            code: 500
        })
    }
}