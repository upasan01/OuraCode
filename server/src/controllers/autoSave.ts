import { Request, Response } from "express";
import Room from "../models/room.model.js";
import { redis } from "../lib/redis.js";

export const autoSave = async (req: Request, res: Response) => {
    res.json({
        message: "Working ig"
    })
}