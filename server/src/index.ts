// starts HTTP and WebSocket server
import dotenv from "dotenv"
dotenv.config()

import http from "http"
import app from "./app.js"
import { Server } from "ws"
//import roomSocketHandler from "./sockets/roomSocketHandler.js"
import { connectDB } from "./config/db.js"

connectDB()

const server = http.createServer(app)
// const wss = new Server ({ server })

// wss.on("connections", roomSocketHandleer)

const PORT = process.env.PORT || 3000

server.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`)
})