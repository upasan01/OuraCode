// route logic
import { Request, Response } from "express";
import Room from "../models/room.model.js";
import crypto from "crypto"

export const createRoom = async (req: Request, res: Response) => {
    try {
        const { username, language, roomId } = req.body

        if (!username || !language || !roomId) {
            return res.status(400).json({
                message: "Username, Language and Room Id is needed",
                code: 400
            })
        }

        const checkRoomId = await Room.findOne({
            roomId: roomId
        })

        if (checkRoomId) {
            return res.status(409).json({
                message: "Room Id already exists",
                code: 409
            })
        }

        const room = await Room.create({
            username: username,
            language: language,
            roomId: roomId
        })

        return res.json({
            message: "Success",
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