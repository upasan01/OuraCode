import { Request, Response } from "express";
import { redis } from "../lib/redis.js";

export const joinRoom = async (req: Request, res: Response) => {
    try {
        const { roomId, username } = req.body

        if (!roomId || !username) {
            return res.status(400).json({
                message: "Enter Room Id and Username",
                code: 400
            })
        }

        const roomInRedis = await redis.exists(`room:${roomId}`)

        if (!roomInRedis) {
            return res.status(404).json({
                message: "Room not found",
                code: 404
            });
        }

        const userLimit = await redis.scard(`room:${roomId}:users`)
        const MAX_USER_LIMITS = 2

        if (userLimit === MAX_USER_LIMITS) {
            return res.status(403).json({
                message: "Maximum amount of users joined already",
                code: 403
            })
        }

        const userExistsInRoom = await redis.sismember(`room:${roomId}:users`, username)

        if (userExistsInRoom) {
            return res.status(409).json({
                message: "Username already exists in this room",
                code: 409
            });
        }

        const data = await redis.get(`room:${roomId}:language`)

        return res.status(200).json({
            message: "Joined successfully",
            room: {
                language: data,
                id: roomId,
                users: await redis.smembers(`room:${roomId}:users`)
            }
        });
    } catch (err) {
        console.error(err)
        return res.status(500).json({
            message: "Something went wrong",
            //@ts-ignore
            error: err.message,
            code: 500
        })
    }
}