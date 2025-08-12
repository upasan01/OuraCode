import { Request, Response } from "express";
import { redis } from "../lib/redis.js";

export const downloadCode = async (req: Request, res: Response) => {
    res.json({
        message: "Working ig"
    })
}