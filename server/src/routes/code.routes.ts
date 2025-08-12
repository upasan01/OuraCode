// initializing code routes

import { Router } from "express";
import { saveCode } from "../controllers/saveCode.js";
import { autoSave } from "../controllers/autoSave.js";
import { downloadCode } from "../controllers/downloadCode.js";

const codeRouter = Router()

codeRouter.post("/save", saveCode)
codeRouter.post("/auto", autoSave)
codeRouter.get("/download", downloadCode)

export default codeRouter