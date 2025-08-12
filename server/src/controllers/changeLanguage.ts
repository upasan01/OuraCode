import { Request, Response } from "express";
import { redis } from "../lib/redis.js";

export const changeLanguage = async (req: Request, res: Response) => {
    try {
        const { language } = req.body
        const { roomId } = req.query

        await redis.set(`room:${roomId}:language`, language)

        return res.json({
            message: "Language changed"
        })
    } catch (err) {
        return res.status(500).json({
            message: "Something went wrong",
            code: 500
        })
    }
}