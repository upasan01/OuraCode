class WebSocketManager {
    constructor() {
        this.socket = null;
        this.connected = false;
        this.username = '';
        this.roomId = null;
        this.callbacks = {} // callback storage (for when things get spicy) 🌶️
    }

    // connection setup (time to slide into the server's world) 🌐💫
    connect(roomId, username, callbacks = {}) {
        this.roomId = roomId;
        this.username = username;
        this.callbacks = callbacks;

        const wsUrl = `ws://localhost:3000`;
        this.socket = new WebSocket(wsUrl);
        this.setupEventListeners();
    }

    // event listener setup (teaching our socket how to behave) 🎭📡
    setupEventListeners() {
        this.socket.onopen = () => {
            this.connected = true;
            this.callbacks.onConnect?.();
            this.joinRoom(this.roomId, this.username);
        };

        this.socket.onmessage = (event) => {
            const message = JSON.parse(event.data);
            this.handleMessage(message);
        };

        this.socket.onclose = () => {
            this.connected = false;
            this.callbacks.onDisconnect?.();
        };

        this.socket.onerror = (error) => {
            console.error('WebSocket error:', error); // not the vibe we wanted 😔
            this.callbacks.onError?.(error);
        };
    }
    
    // incoming message handler (we're basically the message therapist) 📨💬
    handleMessage(message) {
        switch (message.type) {
            case 'load_code':
                this.callbacks.onLoadCode?.(message.code);
                break;
            case 'user_joined':
                this.callbacks.onUserJoined?.(message);
                break;
            case 'code_update':
                this.callbacks.onCodeUpdate?.(message.code, message.username);
                break;
            case 'cursor_update':
                this.callbacks.onCursorUpdate?.(message.username, message.cursorPosition);
                break;
            case 'language_changed':
                this.callbacks.onLanguageChanged?.(message.language, message.username);
                break;
            case 'error':
                this.callbacks.onError?.(new Error(message.message));
                break;
        }
    }
    
    // send message to server (sliding into backend's DMs) 📱✨
    sendMessage(message) {
        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            this.socket.send(JSON.stringify(message));
        } else {
            console.warn('WebSocket not connected, message not sent:', message); // connection said "nah fam" 🚫
        }
    }

    // join room method (knock knock, can we come in?) 🚪✨
    joinRoom(roomId, username) {
        this.sendMessage({
            type: 'join_room',
            roomId,
            username
        });
    }

    // send code changes (sharing the coding tea) ☕💻
    sendCodeChange(roomId, code) {
        this.sendMessage({
            type: 'code_change',
            roomId,
            code
        });
    }

    // cursor sync (showing where the magic happens) ✨👆
    sendCursorSync(roomId, cursorPosition) {
        this.sendMessage({
            type: 'cursor_sync',
            roomId,
            cursorPosition
        });
    }

    // language change broadcaster (switching coding vibes) 
    sendLanguageChange(roomId, language) {
        this.sendMessage({
            type: 'language_change',
            roomId,
            language,
        });
    }

    // connection status check (are we still besties?) 
    isConnected() {
        return this.connected && this.socket && this.socket.readyState === WebSocket.OPEN;
    }

    // disconnect method (time to ghost the server) 
    disconnect() {
        if (this.socket) {
            this.socket.close();
            this.socket = null;
            this.connected = false;
        }
    }
}

// singleton instance (one websocket manager to rule them all) 💍👑
const webSocketManager = new WebSocketManager();

// exported API (the main character energy) ⭐🎭
export const webSocketApi = {
    connect: (roomId, username, callbacks) => webSocketManager.connect(roomId, username, callbacks),
    disconnect: () => webSocketManager.disconnect(),
    sendCodeChange: (roomId, code) => webSocketManager.sendCodeChange(roomId, code),
    sendCursorSync: (roomId, cursorPosition) => webSocketManager.sendCursorSync(roomId, cursorPosition),
    sendLanguageChange: (roomId, language) => webSocketManager.sendLanguageChange(roomId, language),
    isConnected: () => webSocketManager.isConnected()
};
