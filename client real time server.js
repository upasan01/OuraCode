<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Aura Code Collaborate</title>
    <script src="https://cdn.socket.io/4.7.4/socket.io.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/ace/1.32.7/ace.js"></script>
    
    <style>
        /* CSS from style.css */
        body {
            margin: 0;
            font-family: sans-serif;
            display: flex;
            flex-direction: column;
            height: 100vh;
        }
        #status {
            padding: 10px;
            background-color: #333;
            color: white;
            font-size: 14px;
        }
        #editor-container {
            display: flex;
            flex: 1;
        }
        #editor {
            flex: 3;
            height: 100%;
        }
        #chat-aura {
            flex: 1;
            background-color: #282c34;
            color: white;
            padding: 15px;
            display: flex;
            flex-direction: column;
        }
        .aura-message {
            color: #61afef;
        }
        #aura-prompt {
            margin-top: auto;
            padding: 8px;
            border: none;
            border-radius: 4px;
        }
        button {
            padding: 8px;
            margin-top: 5px;
            background-color: #61afef;
            color: white;
            border: none;
            cursor: pointer;
        }
    </style>
</head>
<body>
    <div id="status">Connecting...</div>
    <div id="editor-container">
        <div id="editor"></div>
        <div id="chat-aura">
            <p class="aura-message">🤖 <strong>Aura:</strong> Welcome! What feature are we building today?</p>
            <input type="text" id="aura-prompt" placeholder="Ask Aura for code or suggestions...">
            <button onclick="sendAuraPrompt()">Ask</button>
        </div>
    </div>
    
    <script>
        // Client-side JavaScript Logic
        const ROOM_ID = prompt("Enter Room ID:") || 'default-room';
        const USERNAME = prompt("Enter Username:") || 'Anonymous';
        
        // Connect to the Node.js server (assumed to be on the same host/port 3000)
        const socket = io(); 
        let codeEditor;

        document.addEventListener('DOMContentLoaded', () => {
            // Initialize the ACE Editor
            codeEditor = ace.edit("editor");
            codeEditor.setTheme("ace/theme/monokai");
            codeEditor.session.setMode("ace/mode/javascript");
            document.getElementById('status').textContent = `Room: ${ROOM_ID} | User: ${USERNAME}`;
            
            // 1. Join the room on connection
            socket.emit('join_room', ROOM_ID, USERNAME);

            // 2. Local code change handler (sends change to server)
            codeEditor.session.on('change', (delta) => {
                if (!codeEditor.isUpdating) {
                    socket.emit('code_change', codeEditor.getValue());
                }
            });
        });

        // 3. Handle incoming code updates from other users (server to client)
        socket.on('code_sync', (newCode) => {
            codeEditor.isUpdating = true;
            if (codeEditor.getValue() !== newCode) {
                 const cursorPosition = codeEditor.getCursorPosition();
                 codeEditor.setValue(newCode, 1);
                 codeEditor.gotoLine(cursorPosition.row + 1, cursorPosition.column);
            }
            codeEditor.isUpdating = false;
        });

        // Other status messages
        socket.on('user_joined', (username) => { console.log(`${username} joined.`); });
        socket.on('user_left', (username) => { console.log(`${username} left.`); });

        // --- Conceptual Aura Integration (Client Side) ---
        function sendAuraPrompt() {
            const promptText = document.getElementById('aura-prompt').value;
            if (!promptText) return;
            
            console.log(`Sending prompt to Aura: ${promptText}`);
            
            // In a real app, this would be an AJAX call to the Django/Python API backend
            alert(`Aura is thinking about: "${promptText}". The response would be handled by the Python backend.`);
            
            document.getElementById('aura-prompt').value = '';
        }
    </script>
</body>
</html>

// server.js (Node.js/Express with Socket.IO)
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

// Install dependencies first: npm install express socket.io
const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        // Allows connection from your frontend (index.html)
        origin: "*", 
        methods: ["GET", "POST"]
    }
});

const PORT = process.env.PORT || 3000;

// Serve the index.html file from the same directory
app.use(express.static(__dirname));

const codeState = {}; // Stores the code for each room

io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    // --- 1. Joining a Room ---
    socket.on('join_room', (roomId, username) => {
        socket.join(roomId);
        socket.data.roomId = roomId;
        socket.data.username = username;
        
        // Sync the current code to the new user
        if (codeState[roomId]) {
            socket.emit('code_sync', codeState[roomId]);
        } else {
            codeState[roomId] = '// Start coding here...';
        }
        socket.to(roomId).emit('user_joined', username);
    });

    // --- 2. Real-time Code Update ---
    socket.on('code_change', (newCode) => {
        const roomId = socket.data.roomId;
        if (roomId) {
            codeState[roomId] = newCode;
            // Broadcast to all other clients in the room
            socket.to(roomId).emit('code_sync', newCode);
        }
    });
    
    // --- 3. Disconnect ---
    socket.on('disconnect', () => {
        const username = socket.data.username || 'A user';
        const roomId = socket.data.roomId;
        if (roomId) {
             socket.to(roomId).emit('user_left', username);
        }
        // In a production app, you might clean up empty rooms here.
    });
});

server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

# execution_api.py (Conceptual Django/Flask API)
import json
import subprocess
import os
# LLM frameworks (like the Gemini API or OpenAI) would be imported here
# from google import gemini_llm

# WARNING: This code is for demonstration only and is highly UNSAFE 
# for production use without secure sandboxing (e.g., Docker containers).

# --- Conceptual API for Code Execution ---
def execute_code(request):
    """Simulates running Python or Java code securely."""
    try:
        data = json.loads(request.body.decode('utf-8'))
        code = data.get('code', '')
        language = data.get('language', 'python')
        
        if language == 'python':
            # Example for Python execution
            temp_file = "temp_code.py"
            with open(temp_file, "w") as f:
                f.write(code)
            
            process = subprocess.run(
                ['python', temp_file], 
                capture_output=True, text=True, timeout=5
            )
            os.remove(temp_file)
            return {"output": process.stdout, "error": process.stderr}

        elif language == 'java':
            # Java requires compilation (javac) then execution (java)
            return {"output": "", "error": "Java execution requires a compiler setup (Javac/JVM)."}
        
        return {"output": "", "error": f"Language {language} not supported."}

    except subprocess.TimeoutExpired:
        return {"output": "", "error": "Execution timed out (5s limit)."}
    except Exception as e:
        return {"output": "", "error": f"Execution error: {str(e)}"}

# --- Conceptual API for Aura (AI) Prompting ---
def aura_prompt(request):
    """Simulates sending code context and prompt to the AI model."""
    data = json.loads(request.body.decode('utf-8'))
    prompt = data.get('prompt')
    current_code = data.get('code')
    language = data.get('language')
    
    # 1. Prepare context for the LLM
    llm_input = f"As a pair programmer, please respond to the following prompt: '{prompt}'. Current code in {language} is:\n{current_code}"
    
    # 2. Call the LLM (This is the conceptual step that needs an actual API call)
    # response = gemini_llm.generate_code(llm_input)
    
    # Placeholder LLM response:
    ai_suggestion = f"// Aura Suggestion: I recommend implementing the '{prompt.split(' ')[0]}' function in {language} as follows..."
    
    return {"suggestion": ai_suggestion}
