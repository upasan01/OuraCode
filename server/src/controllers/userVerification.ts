// user verification for link entry
import { Request, Response } from "express";
import { redis } from "../lib/redis.js";

export const roomAndUserIsReal = async (req: Request, res: Response) => {
    try {
        const { roomId } = req.query

        const roomIdValid = await redis.exists(`room:${roomId}:language`)

        if(!roomIdValid){
            return res.status(404).json({
                message: "Room not found",
                code: 404
            })
        }

        return res.json({
            message: "Room found"
        })
    }catch(err){
        return res.status(500).json({
            message: "Somethhing went wrong",
            //@ts-ignore
            error: err.message,
            code:500
        })
    }
}