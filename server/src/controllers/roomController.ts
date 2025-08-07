// route logic
import { Request, Response } from "express";

export const getResult = (req: Request, res: Response) => {
    return res.json({
        message: "Success",
        code: 200
    })
}