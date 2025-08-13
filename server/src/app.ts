// Express app initilization without listen

import express from "express";
import cors from "cors"
import roomRouter from "./routes/room.routes.js";
import codeRouter from "./routes/code.routes.js";

const app = express()

app.use(cors({
    origin: "http://localhost:5173",
    exposedHeaders: ["Content-Disposition", "Content-Type"]
}))
app.use(express.json())

app.use("/api/v1/room", roomRouter)
app.use("/api/v1/code", codeRouter)

export default app