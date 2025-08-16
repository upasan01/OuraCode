// WebSocket API for real-time code synchronization
// Matches the backend implementation in roomSocketHandler.ts

class WebSocketApi {
  constructor() {
    this.ws = null;
    this.isConnected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000;
    this.messageHandlers = new Map();
    this.connectionHandlers = [];
    this.disconnectionHandlers = [];
    this.errorHandlers = [];
    this.currentRoomId = null;
    this.currentUsername = null;
    this.connectionUrl = null;
    this.isConnecting = false;
  }

  /**
   * Initialize WebSocket connection with room and user info
   * @param {string} url - WebSocket server URL
   * @param {string} roomId - Room ID to join
   * @param {string} username - Username
   */
  async initialize(url, roomId, username) {
    this.connectionUrl = url;
    this.currentRoomId = roomId;
    this.currentUsername = username;
    
    console.log(`Initializing WebSocket for room ${roomId} as ${username}`);
    
    await this.connect();
    
    if (this.isConnected) {
      await this.joinRoom(roomId, username);
    }
    
    return this.isConnected;
  }

  /**
   * Connect to WebSocket server
   * @param {string} url - WebSocket server URL (optional if already set)
   */
  connect(url) {
    // Use provided URL or previously set URL
    const wsUrl = url || this.connectionUrl || 'ws://localhost:3000';
    this.connectionUrl = wsUrl;
    
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      console.warn('WebSocket is already connected');
      return Promise.resolve();
    }

    if (this.isConnecting) {
      console.warn('WebSocket connection already in progress');
      return Promise.resolve();
    }

    this.isConnecting = true;

    return new Promise((resolve, reject) => {
      try {
        console.log('Connecting to WebSocket:', wsUrl);
        this.ws = new WebSocket(wsUrl);

        this.ws.onopen = (event) => {
          this.isConnected = true;
          this.isConnecting = false;
          this.reconnectAttempts = 0;
          console.log('WebSocket connected successfully');
          
          // Notify connection handlers
          this.connectionHandlers.forEach(handler => {
            try {
              handler(event);
            } catch (error) {
              console.error('Error in connection handler:', error);
            }
          });
          resolve(event);
        };

        this.ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            this.handleMessage(data);
          } catch (error) {
            console.error('Failed to parse WebSocket message:', error, event.data);
          }
        };

        this.ws.onclose = (event) => {
          this.isConnected = false;
          this.isConnecting = false;
          console.log('WebSocket connection closed:', event.code, event.reason);
          
          // Notify disconnection handlers
          this.disconnectionHandlers.forEach(handler => {
            try {
              handler(event);
            } catch (error) {
              console.error('Error in disconnection handler:', error);
            }
          });
          
          // Attempt reconnection if not a clean close
          if (event.code !== 1000 && this.reconnectAttempts < this.maxReconnectAttempts) {
            this.attemptReconnection();
          }
        };

        this.ws.onerror = (error) => {
          this.isConnecting = false;
          console.error('WebSocket error:', error);
          this.errorHandlers.forEach(handler => {
            try {
              handler(error);
            } catch (err) {
              console.error('Error in error handler:', err);
            }
          });
          reject(error);
        };

      } catch (error) {
        console.error('Failed to create WebSocket connection:', error);
        reject(error);
      }
    });
  }

  /**
   * Attempt to reconnect to WebSocket server
   */
  attemptReconnection() {
    if (this.isConnecting) return;
    
    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1); // Exponential backoff
    
    console.log(`Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
    
    setTimeout(async () => {
      try {
        await this.connect();
        // Rejoin room if we were in one
        if (this.isConnected && this.currentRoomId && this.currentUsername) {
          await this.joinRoom(this.currentRoomId, this.currentUsername);
        }
      } catch (error) {
        console.error('Reconnection failed:', error);
        // Will try again or give up based on max attempts
      }
    }, delay);
  }

  /**
   * Send a message through WebSocket
   * @param {Object} message - Message to send
   */
  send(message) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.warn('WebSocket is not connected. Message not sent:', message);
      return false;
    }

    try {
      this.ws.send(JSON.stringify(message));
      return true;
    } catch (error) {
      console.error('Failed to send WebSocket message:', error);
      return false;
    }
  }

  /**
   * Handle incoming WebSocket messages
   * @param {Object} data - Parsed message data
   */
  handleMessage(data) {
    const { type } = data;
    
    if (this.messageHandlers.has(type)) {
      this.messageHandlers.get(type).forEach(handler => {
        try {
          handler(data);
        } catch (error) {
          console.error(`Error in message handler for type "${type}":`, error);
        }
      });
    } else {
      console.warn('No handler registered for message type:', type);
    }
  }

  /**
   * Register a message handler for a specific message type
   * @param {string} type - Message type
   * @param {Function} handler - Handler function
   */
  on(type, handler) {
    if (!this.messageHandlers.has(type)) {
      this.messageHandlers.set(type, []);
    }
    this.messageHandlers.get(type).push(handler);
  }

  /**
   * Remove a message handler
   * @param {string} type - Message type
   * @param {Function} handler - Handler function to remove
   */
  off(type, handler) {
    if (this.messageHandlers.has(type)) {
      const handlers = this.messageHandlers.get(type);
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }
  }

  /**
   * Register connection event handlers
   */
  onConnect(handler) {
    // Clear existing handlers to prevent duplicates
    this.connectionHandlers = [];
    this.connectionHandlers.push(handler);
  }

  onDisconnect(handler) {
    // Clear existing handlers to prevent duplicates
    this.disconnectionHandlers = [];
    this.disconnectionHandlers.push(handler);
  }

  onError(handler) {
    // Clear existing handlers to prevent duplicates
    this.errorHandlers = [];
    this.errorHandlers.push(handler);
  }

  /**
   * Join a room - matches backend join_room message type
   * @param {string} roomId - Room ID to join
   * @param {string} username - Username
   */
  async joinRoom(roomId, username) {
    this.currentRoomId = roomId;
    this.currentUsername = username;
    
    if (!this.isConnected) {
      throw new Error('WebSocket not connected');
    }
    
    console.log(`Joining room ${roomId} as ${username}`);
    return this.send({
      type: 'join_room',
      roomId,
      username
    });
  }

  /**
   * Send code changes to other users in the room - matches backend code_change message type
   * @param {string} roomId - Room ID
   * @param {string} code - Updated code content
   */
  sendCodeChange(roomId, code) {
    return this.send({
      type: 'code_change',
      roomId,
      code
    });
  }

  /**
   * Send cursor position to other users - matches backend cursor_sync message type
   * @param {string} roomId - Room ID
   * @param {Object} cursorPosition - Cursor position {line, column}
   */
  sendCursorSync(roomId, cursorPosition) {
    return this.send({
      type: 'cursor_sync',
      roomId,
      cursorPosition
    });
  }

  /**
   * Disconnect WebSocket
   */
  disconnect() {
    console.log('Disconnecting WebSocket...');
    if (this.ws) {
      this.ws.close(1000, 'Client disconnect');
      this.ws = null;
    }
    this.isConnected = false;
    this.isConnecting = false;
    this.currentRoomId = null;
    this.currentUsername = null;
    this.reconnectAttempts = 0;
  }

  /**
   * Reset connection state
   */
  reset() {
    this.disconnect();
    this.messageHandlers.clear();
    this.connectionHandlers = [];
    this.disconnectionHandlers = [];
    this.errorHandlers = [];
  }

  /**
   * Get connection status
   */
  getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      readyState: this.ws ? this.ws.readyState : WebSocket.CLOSED,
      currentRoom: this.currentRoomId,
      username: this.currentUsername
    };
  }

  /**
   * Clear all message handlers
   */
  clearHandlers() {
    this.messageHandlers.clear();
    this.connectionHandlers = [];
    this.disconnectionHandlers = [];
    this.errorHandlers = [];
  }
}

// Create a singleton instance
const wsApi = new WebSocketApi();

// Utility functions for easier usage
export const webSocketApi = {
  // Enhanced connection management
  initialize: (url, roomId, username) => wsApi.initialize(url, roomId, username),
  connect: (url) => wsApi.connect(url),
  disconnect: () => wsApi.disconnect(),
  reset: () => wsApi.reset(),
  
  // Room management - matches backend exactly
  joinRoom: (roomId, username) => wsApi.joinRoom(roomId, username),
  
  // Code synchronization - matches backend message types exactly
  sendCodeChange: (roomId, code) => wsApi.sendCodeChange(roomId, code),
  sendCursorSync: (roomId, cursorPosition) => wsApi.sendCursorSync(roomId, cursorPosition),
  
  // Event handlers
  onMessage: (type, handler) => wsApi.on(type, handler),
  offMessage: (type, handler) => wsApi.off(type, handler),
  onConnect: (handler) => wsApi.onConnect(handler),
  onDisconnect: (handler) => wsApi.onDisconnect(handler),
  onError: (handler) => wsApi.onError(handler),
  
  // Utilities
  getStatus: () => wsApi.getConnectionStatus(),
  clearHandlers: () => wsApi.clearHandlers(),
  
  // Direct access to the instance for advanced usage
  instance: wsApi
};

// Message type constants - matches backend exactly
export const MESSAGE_TYPES = {
  // Outgoing messages (client to server) - matches backend RoomSocketMessage type
  JOIN_ROOM: 'join_room',
  CODE_CHANGE: 'code_change',
  CURSOR_SYNC: 'cursor_sync',
  
  // Incoming messages (server to client) - matches what backend sends
  LOAD_CODE: 'load_code',
  CODE_UPDATE: 'code_update',  
  USER_JOINED: 'user_joined',
  ERROR: 'error'
};

export default webSocketApi;
