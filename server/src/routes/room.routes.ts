// initializing room routes

import { Router } from "express";
import { createRoom } from "../controllers/createRoom.js";

const roomRouter = Router()

roomRouter.post("/create", createRoom)

export default roomRouter