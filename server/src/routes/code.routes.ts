// initializing code routes

import { Router } from "express";
import { saveCode } from "../controllers/saveCode.js";
import { downloadCode } from "../controllers/downloadCode.js";
import { runCode } from "../controllers/runCode.js";

const codeRouter = Router()

codeRouter.post("/save", saveCode)
codeRouter.post("/download", downloadCode)
codeRouter.post("/run", runCode)

export default codeRouter