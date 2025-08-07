// Express app initilization without listen

import express from "express";
import cors from "cors"
import roomRouter from "./routes/room.routes.js";

const app = express()

app.use(cors())
app.use(express.json())

app.use("/api/v1/room", roomRouter)

export default app