import { Request, Response } from "express";
import { redis } from "../lib/redis.js";

export const saveCode = async (req: Request, res: Response) => {
    try {

        const { roomId, username } = req.query
        const { code } = req.body

        if(!code){
            return res.status(404).json({
                message: "Write something",
                code: 404
            })
        }

        const roomExists = await redis.exists(`room:${roomId}:language`)

        if(!roomExists){
            return res.status(404).json({
                message: "Room not found",
                code: 404
            })
        }

        const redisValue = await redis.set(`room:${roomId}:code`, code)

        return res.json({
            message: "Code saved successfully",
            redisValue
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