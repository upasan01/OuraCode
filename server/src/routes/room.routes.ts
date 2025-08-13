// initializing room routes

import { Router } from "express";
import { createRoom } from "../controllers/createRoom.js";
import { joinRoom } from "../controllers/joinRoom.js";
import { roomAndUserIsReal } from "../controllers/userVerification.js";

const roomRouter = Router()

roomRouter.post("/create", createRoom)
roomRouter.post("/join", joinRoom)
roomRouter.post("/verify", roomAndUserIsReal)

export default roomRouter