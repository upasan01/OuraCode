import { Request, Response } from "express";
import Room from "../models/room.model.js";
import { redis } from "../lib/redis.js";

export const saveCode = async (req: Request, res: Response) => {
    try {
        // this process for ws
        /*const params = new URLSearchParams(req.url?.split("?")[1])
        const roomId = params.get("roomId")
        const username = params.get("username")*/

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

        // will add mongo add in ws close/disconnected
        /*const currentRoom = await Room.findOneAndUpdate(
            {roomId},
            {
                code: code
            },
            { new: true }
        )*/

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