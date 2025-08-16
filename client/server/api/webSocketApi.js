export const MESSAGE_TYPES = {
    JOIN_ROOM: 'join_room',
    CODE_CHANGE: 'code_change',
    CURSOR_SYNC: 'cursor_sync',
}

class WebSocketManager {
    constructor() {
        this.socket = null;
        this.connected = false;
        this.username = '';
        this.roomId = null;
        this.callbacks = {}
    }


    connect(roomId, username, callbacks = {}) {
        this.roomId = roomId;
        this.username = username;
        this.callbacks = callbacks;

        const wsUrl = `ws://localhost:3000`;
        this.socket = new WebSocket(wsUrl);
        this.setupEventListeners();
    }

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
            console.error('WebSocket error:', error);
            this.callbacks.onError?.(error);
        };
    }

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
            case 'error':
                this.callbacks.onError?.(new Error(message.message));
                break;
        }
    }

    sendMessage(message) {
        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            this.socket.send(JSON.stringify(message));
        } else {
            console.warn('WebSocket not connected, message not sent:', message);
        }
    }

    joinRoom(roomId, username) {
        this.sendMessage({
            type: MESSAGE_TYPES.JOIN_ROOM,
            roomId,
            username
        });
    }

    sendCodeChange(roomId, code) {
        this.sendMessage({
            type: MESSAGE_TYPES.CODE_CHANGE,
            roomId,
            code
        });
    }

    sendCursorSync(roomId, cursorPosition) {
        this.sendMessage({
            type: MESSAGE_TYPES.CURSOR_SYNC,
            roomId,
            cursorPosition
        });
    }

    isConnected() {
        return this.connected && this.socket && this.socket.readyState === WebSocket.OPEN;
    }

    disconnect() {
        if (this.socket) {
            this.socket.close();
            this.socket = null;
            this.connected = false;
        }
    }
}

const webSocketManager = new WebSocketManager();

export const webSocketApi = {
    connect: (roomId, username, callbacks) => webSocketManager.connect(roomId, username, callbacks),
    disconnect: () => webSocketManager.disconnect(),
    sendCodeChange: (roomId, code) => webSocketManager.sendCodeChange(roomId, code),
    sendCursorSync: (roomId, cursorPosition) => webSocketManager.sendCursorSync(roomId, cursorPosition),
    isConnected: () => webSocketManager.isConnected()
};
