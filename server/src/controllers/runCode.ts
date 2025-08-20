import { Request, Response } from "express";
import path from "path";
import { redis } from "../lib/redis.js";
import fs from "fs"
import os from "os"
import { spawn } from "child_process";

const languageCommands = {
    c: (file: string) => ["sh", "-c", `gcc ${file} -o /code/a.out && /code/a.out`],
    cpp: (file: string) => ["sh", "-c", `g++ ${file} -o /code/a.out && /code/a.out`],
    cs: (file: string) => ["sh", "-c", `mcs ${file} -out:/code/main.exe && mono /code/main.exe`],
    js: (file: string) => ["node", file],
    py: (file: string) => ["python3", file],
    java: (file: string) => ["sh", "-c", `javac ${file} -d /code && java -cp /code ${path.basename(file, '.java')}`],
    go: (file: string) => ["go", "run", file],
};

export const runCode = async (req: Request, res: Response) => {
    try {
        const { code } = req.body
        const { roomId } = req.query

        const language = await redis.get(`room:${roomId}:language`)
        //const language = "py" // for testing
        console.log(language)

        // @ts-ignore
        if (!language || !code || !languageCommands[language]) {
            return res.status(400).json({
                message: "Invalid request",
                code: 400
            })
        }

        // temporary directory - linux/prod
        /*const tempDir = path.join("/tmp", `${Date.now()}-${Math.random()}`)
        fs.mkdirSync(tempDir)*/

        // win
        const tempDir = path.join(os.tmpdir(), `${Date.now()}-${Math.random()}`)
        fs.mkdirSync(tempDir, { recursive: true })
        console.log(tempDir)

        const extension = language
        const filePath = path.join(tempDir, `main.${extension}`)
        // writting the code inside code.ext file
        fs.writeFileSync(filePath, code);
        console.log(filePath)

        // docker run command
        const dockerCmd = [
            "run", // run new docker container
            "--rm", // after process exits auto remove the container
            "--network", "none", // disable network inside container
            "--memory", "200m", // container ram limit 200mb
            "--cpus", "0.5", // half core usage
            "-v", `${tempDir}:/code`, // mounts host folder in container, tempDis host folder and /code is where the code will appear in container
            "custom-compiler", // my custom docker image name
            //@ts-ignore
            ...languageCommands[language](`/code/main.${extension}`) // tells the container run command for the given lang
        ]

        // spawn docker process
        const docker = spawn("docker", dockerCmd, { timeout: 10000 })

        let output = "", error = "";

        docker.stdout.on("data", data => output += data.toString()) // saving the op data in output
        docker.stderr.on("data", data => error += data.toString()) // saving the err data in error

        // checking err
        docker.on("error", (err) => {
            // removing the temp file
            fs.rmSync(tempDir, { recursive: true, force: true });
            return res.status(500).json({ error: err.message });
        });

        // child process exits
        docker.on("close", (code, signal) => {
            fs.rmSync(tempDir, { recursive: true, force: true });

            // if once timeout hit it sends SIGTERM
            if (signal === "SIGTERM") {
                return res.json({ output: "", error: "Execution timed out" });
            }

            res.json({ output, error });
        });
    } catch (err) {
        console.error("something went wrong: ", err)
        return res.status(500).json({
            message: "something went wrong",
            //@ts-ignore
            error: err.message,
            code: 500
        })
    }
}