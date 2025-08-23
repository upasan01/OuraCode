// initializing code routes

import { Router } from "express";
import { saveCode } from "../controllers/saveCode.js";
import { downloadCode } from "../controllers/downloadCode.js";

const codeRouter = Router()

codeRouter.post("/save", saveCode)
codeRouter.post("/download", downloadCode)

export default codeRouter