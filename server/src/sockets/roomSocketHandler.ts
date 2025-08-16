import { WebSocket, WebSocketServer } from "ws";
import { redis } from "../lib/redis.js";

interface ExtWebSocket extends WebSocket {
    roomId?: string;
    username?: string;
    code?: string;
}

interface BaseMessage {
    type: string;
}

interface JoinRoomMessage extends BaseMessage {
    type: "join_room";
    roomId: string;
    username: string;
}

interface CodeChangeMessage extends BaseMessage {
    type: "code_change";
    roomId: string;
    code: string;
}

interface CursorSyncMessage extends BaseMessage {
    type: "cursor_sync";
    roomId: string;
    cursorPosition: { line: number; column: number };
}

type RoomSocketMessage =
    | JoinRoomMessage
    | CodeChangeMessage
    | CursorSyncMessage;

export const roomSocketHandler = (ws: ExtWebSocket, wss: WebSocketServer) => {
    ws.on("error", (error) => console.error(error));
    console.log("client connected");

    ws.on("message", async (msg) => {
        let data: RoomSocketMessage;

        try {
            data = JSON.parse(msg.toString());
        } catch (error) {
            console.error("Invalid JSON: ", msg.toString());
            return;
        }

        switch (data.type) {
            case "join_room": {
                try {
                    const { roomId, username } = data;
                    ws.roomId = roomId;
                    ws.username = username;
                    console.log(`${username} joined room ${roomId}`);

                    const code = await redis.get(`room:${roomId}:code`)

                    ws.send(JSON.stringify({
                        type: "load_code",
                        code: code || ""
                    }))

                    // add brodcast
                    brodcastToRoom(wss, roomId, {
                        type: "user_joined",
                        message: `${username} joined the room`,
                        username
                    }, ws)
                } catch (err) {
                    console.error("Join room failed:", err);
                    ws.send(JSON.stringify({
                        type: "error",
                        message: "Failed to join room. Please try again."
                    }));
                }

                break;
            }
            case "code_change": {
                if (!ws.roomId) return
                // ws.code will be defined here
                try {
                    ws.code = data.code

                    brodcastToRoom(wss, data.roomId, {
                        type: "code_update",
                        code: data.code,
                        username: ws.username
                    }, ws)
                } catch (err) {
                    console.error("Code change failed: ", err)
                    ws.send(JSON.stringify({
                        type: "error",
                        message: "Failed to change the code."
                    }))
                }
                break;
            }
            case "cursor_sync": {
                if (!ws.roomId) return

                try {
                    brodcastToRoom(wss, ws.roomId, {
                        type: "cursor_update",
                        username: ws.username,
                        cursorPosition: data.cursorPosition
                    }, ws);
                } catch (err) {
                    console.error(err)
                }
                break;
            }
        }
    });

    ws.on("close", async () => {
        console.log(`${ws.username} disconnected from ${ws.roomId}`);

        if (ws.roomId && ws.username) {
            try {
                await redis.srem(`room:${ws.roomId}:users`, ws.username).catch(console.error)

                if (typeof ws.code === "string") {
                    await redis.set(`room:${ws.roomId}:code`, ws.code).catch(console.error)
                    console.log(ws.code)
                }
            }
            catch (err) {
                console.error("Error during closing", err)
            }
        }
    });
};

function brodcastToRoom(wss: WebSocketServer, roomId: string, message: object, excludeWs?: WebSocket) {
    const data = JSON.stringify(message)

    wss.clients.forEach(client => {
        if ((client as any).roomId === roomId && client.readyState === WebSocket.OPEN && client !== excludeWs) {
            client.send(data)
        }
    })
}