import { Request, Response } from "express";
import { redis } from "../lib/redis.js";

export const downloadCode = async (req: Request, res: Response) => {
    try {
        const { code } = req.body
        const { roomId } = req.query

        if (!code) {
            return res.status(404).json({
                message: "Can not download empty page",
                code: 404
            })
        }

        const language = await redis.get(`room:${roomId}:language`)
        const fileName = `code.${language || "txt"}`

        res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
        res.setHeader("Content-Type", "text/plain; charset=utf-8");
        return res.send(code);

    } catch (err) {
        return res.status(500).json({
            message: "Something Went Wrong",
            //@ts-ignore
            error: err.message,
            code: 500
        })
    }
}