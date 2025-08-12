// initializing code routes

import { Router } from "express";
import { saveCode } from "../controllers/saveCode.js";

const codeRouter = Router()

codeRouter.post("/save", saveCode)

export default codeRouter