// websocket logic
import { WebSocket } from "ws";

interface BaseMessage {
    type: string;
}

interface JoinRoomMessage extends BaseMessage {
    type: "join_room";
    roomId: string;
    username: string;
}

interface LeaveRoomMessage extends BaseMessage {
    type: "leave_room";
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
    | LeaveRoomMessage
    | CodeChangeMessage
    | CursorSyncMessage;


export const roomSocketHandler = (ws: WebSocket) => {
    ws.on("error", (error) => console.error(error))
    console.log("client connected")

    ws.on("message", (msg) => {
        let data: RoomSocketMessage;

        try {
            data = JSON.parse(msg.toString())
        } catch (error) {
            console.error("Invalid JSON: ", msg.toString())
            return
        }

        switch (data.type) {
            case "join_room":
                console.log(`${data.username} joined room ${data.roomId}`)
                break;

            case "code_change":
                console.log("code changed")
                break;

            case "cursor_sync":
                console.log("cursor moved")
                break;

            case "leave_room":
                console.log("left room")
                break;

            default:
                //@ts-ignore
                console.warn("Unknown event type: ", data.type)
        }
    });

    ws.on("close", () => {
        console.log("client disconnected")

    })
}