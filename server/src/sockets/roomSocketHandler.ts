import { WebSocket, WebSocketServer } from "ws";
import path from "path";
import { redis } from "../lib/redis.js";
import fs from "fs"
import os from "os"
import { spawn } from "child_process";

interface ExtWebSocket extends WebSocket {
    roomId?: string;
    username?: string;
    code?: string;
    language?: string;
    docker?: any;
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

interface LanguageChangeMessage extends BaseMessage {
    type: "language_change";
    roomId: string;
    language: string
}

interface AllUserMessage extends BaseMessage {
    type: "all_user";
    roomId: string;
    users: string[];
}

interface RunCodeMessage extends BaseMessage {
    type: "run_code";
    roomId: string;
    language: string;
    code: string;
}

interface StdinMessage extends BaseMessage {
    type: "stdin",
    docker: any;
    data: any;
}

type RoomSocketMessage =
    | JoinRoomMessage
    | CodeChangeMessage
    | CursorSyncMessage
    | LanguageChangeMessage
    | AllUserMessage
    | RunCodeMessage
    | StdinMessage;

const languageCommands = {
    c: (file: string) => ["sh", "-c", `gcc ${file} -o /code/a.out && /code/a.out`],
    cpp: (file: string) => ["sh", "-c", `g++ ${file} -o /code/a.out && /code/a.out`],
    cs: (file: string) => ["sh", "-c", `mcs ${file} -out:/code/main.exe && mono /code/main.exe`],
    js: (file: string) => ["node", file],
    py: (file: string) => ["python3", file],
    java: (file: string) => ["sh", "-c", `javac ${file} -d /code && java -cp /code ${path.basename(file, '.java')}`],
    go: (file: string) => ["go", "run", file],
};

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
                    console.log(`${username} joined room ${roomId}`)
                    // this makes it sure that redis dosent loses user on refresh
                    await redis.sadd(`room:${roomId}:users`, username);

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

            case "language_change": {
                if (!ws.roomId) return

                try {
                    ws.language = data.language

                    await redis.set(`room:${ws.roomId}:language`, ws.language)

                    brodcastToRoom(wss, ws.roomId, {
                        type: "language_changed",
                        username: ws.username,
                        language: ws.language
                    }, ws)
                } catch (err) {
                    console.error("Failed to change language: ", err)
                    ws.send(JSON.stringify({
                        type: "error",
                        message: "Failed to change language"
                    }))
                }
                break;
            }

            case "all_user": {
                if (!ws.roomId) return
                try {
                    const users = await redis.smembers(`room:${ws.roomId}:users`)
                    //console.log(users)
                    ws.send(JSON.stringify({
                        type: "all_users_sent",
                        users
                    }));
                } catch (err) {
                    console.error("Failed to get all users: ", err)
                    ws.send(JSON.stringify({
                        type: "error",
                        message: "Failed to get all users"
                    }))
                }
                break;
            }

            case "run_code": {
                if (!ws.roomId) return
                try {
                    ws.code = data.code
                    const language = await redis.get(`room:${ws.roomId}:language`)
                    //console.log(language)
                    let code = ws.code

                    // temp dir - linux/prod
                    /*const tempDir = path.join("/tmp", `${Date.now()}-${Math.random()}`)
                    fs.mkdirSync(tempDir)*/

                    // win
                    const tempDir = path.join(os.tmpdir(), `${Date.now()}-${Math.random()}`)
                    fs.mkdirSync(tempDir, { recursive: true })
                    //console.log(tempDir)

                    const extension = language
                    const filePath = path.join(tempDir, `main.${extension}`)
                    // auto-inject flushing for all C/C++ codes - VIBE CODED
                    if (language === "c" || language === "cpp") {
                        code = ws.code.replace(
                            /int\s+main\s*\([^)]*\)\s*{/,
                            match => `${match}\n    setvbuf(stdout, NULL, _IONBF, 0);`
                        );
                    }

                    // writting the code inside code.ext file
                    fs.writeFileSync(filePath, code);
                    //console.log(filePath)

                    // docker run command
                    const dockerCmd = [
                        "run", // run new docker container
                        "--rm", // after process exits auto remove the container
                        "-i", //enables stdin
                        "--network", "none", // disable network inside container
                        "--memory", "200m", // container ram limit 200mb
                        "--cpus", "0.5", // half core usage
                        "-v", `${tempDir}:/code`, // mounts host folder in container, tempDis host folder and /code is where the code will appear in container
                        "custom-compiler", // my custom docker image name
                        //@ts-ignore
                        ...languageCommands[language](`/code/main.${extension}`) // tells the container run command for the given lang
                    ]

                    // spawn docker process
                    const docker = spawn("docker", dockerCmd, {
                        timeout: 20000,
                        stdio: ["pipe", "pipe", "pipe"]  // important! gives stdin, stdout, stderr
                    })
                    ws.docker = docker;

                    docker.stdout.on("data", data => {
                        ws.send(JSON.stringify({ type: "stdout", data: data.toString() })) // saving the op data in output
                    })

                    docker.stderr.on("data", data => {
                        ws.send(JSON.stringify({ type: "stderr", data: data.toString() })) // saving the err data in error
                    })

                    // checking err
                    docker.on("error", (err) => {
                        // removing the temp file
                        fs.rmSync(tempDir, { recursive: true, force: true });
                        console.error(err)
                        ws.send(JSON.stringify({
                            type: "error",
                            message: err.message
                        }))
                        return;
                    });

                    // killing the term if it takaes longer then grace period
                    const killTimer = setTimeout(() => {
                        docker.kill("SIGKILL")
                    }, 20000)

                    // child process exits
                    docker.on("close", (code, signal) => {
                        clearTimeout(killTimer)
                        fs.rmSync(tempDir, { recursive: true, force: true });

                        // if once timeout hit it sends SIGTERM
                        if (signal === "SIGTERM" || signal === "SIGKILL") {
                            ws.send(JSON.stringify({
                                type: "error",
                                message: "Execution time out",
                                output: ""
                            }))
                            return
                        }

                        ws.send(JSON.stringify({ type: "done", exitCode: code }))
                    });
                } catch (err) {
                    console.error("Faied to run the code: ", err)
                    ws.send(JSON.stringify({
                        type: "error",
                        message: "Failed to run code"
                    }))
                    return
                }
                break;
            }

            // STDIN (user input)
            case "stdin": {
                if (ws.docker && ws.docker.stdin.writable) {
                    if (data.data === null) {
                        ws.docker.stdin.end(); // close pipe
                    } else {
                        ws.docker.stdin.write(data.data + "\n");
                    }
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
                    //console.log(ws.code)
                }

                brodcastToRoom(wss, ws.roomId, {
                    type: "room_left",
                    username: ws.username,
                    message: `${ws.username} left the room` // added message for client
                })
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