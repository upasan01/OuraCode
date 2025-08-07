// initializing room routes

import { Router } from "express";
import { getResult } from "../controllers/roomController.js";

const roomRouter = Router()

roomRouter.get("/", getResult)

export default roomRouter