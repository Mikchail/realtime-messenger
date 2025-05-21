import { create } from 'zustand';
import io from 'socket.io-client';
import { useChatStore } from './chatStore';
import { useAuthStore } from './authStore';

export const useSocketStore = create((set, get) => ({
  socket: null,
  connected: false,
  
  // Initialize socket connection
  initSocket: () => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.warn('No token found, socket initialization aborted');
      return;
    }
    
    // Check if socket already exists and is connected
    const currentSocket = get().socket;
    if (currentSocket && currentSocket.connected) {
      console.log('Socket already connected');
      return currentSocket;
    }
    
    // Clear old socket if exists
    if (currentSocket) {
      console.log('Cleaning up old socket connection');
      currentSocket.disconnect();
    }
    
    const socketUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    console.log(`Initializing socket connection to ${socketUrl}`);
    
    const socket = io(socketUrl, {
      auth: { token },
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 10000
    });
    
    socket.on('connect', () => {
      console.log('Socket connected with ID:', socket.id);
      set({ connected: true, socket });
      
      // Join all chats the user is part of
      const chats = useChatStore.getState().chats;
      if (chats && chats.length > 0) {
        console.log(`Auto-joining ${chats.length} chats`);
        chats.forEach(chat => {
          socket.emit('joinChat', chat._id);
        });
      }
    });
    
    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      set({ connected: false });
    });
    
    socket.on('disconnect', (reason) => {
      console.log('Socket disconnected. Reason:', reason);
      set({ connected: false });
    });
    
    socket.on('error', (err) => {
      console.error('Socket error:', err);
    });
    
    // Message events
    socket.on('newMessage', (message) => {
      console.log('New message received:', message);
      
      if (!message || !message._id || !message.chatId) {
        console.error('Received invalid message format:', message);
        return;
      }
      
      try {
        useChatStore.getState().addNewMessage(message);
      } catch (error) {
        console.error('Error processing new message:', error);
      }
    });
    
    // Typing events
    socket.on('typing', ({ chatId, userId }) => {
      console.log(`User ${userId} is typing in chat ${chatId}`);
      useChatStore.getState().setUserTyping(chatId, userId, true);
    });
    
    socket.on('stopTyping', ({ chatId, userId }) => {
      console.log(`User ${userId} stopped typing in chat ${chatId}`);
      useChatStore.getState().setUserTyping(chatId, userId, false);
    });
    
    // Read status events
    socket.on('messageRead', ({ messageId, userId }) => {
      console.log(`Message ${messageId} was read by user ${userId}`);
      
      // Update read status in messages
      const { messages } = useChatStore.getState();
      if (!messages.length) return;
      
      const messageExists = messages.some(m => m._id === messageId);
      if (!messageExists) {
        console.log('Message not found in local state, skipping update');
        return;
      }
      
      const updatedMessages = messages.map(message => {
        if (message._id === messageId) {
          // Initialize readBy array if it doesn't exist
          const readBy = Array.isArray(message.readBy) ? [...message.readBy] : [];
          
          // Add userId to readBy if not already included
          if (!readBy.some(id => {
            // Handle both string IDs and object IDs
            if (typeof id === 'string') {
              return id === userId;
            } else if (id._id) {
              return id._id === userId;
            }
            return false;
          })) {
            readBy.push(userId);
          }
          
          return {
            ...message,
            readBy
          };
        }
        return message;
      });
      
      useChatStore.setState({ messages: updatedMessages });
    });
    
    // User status events
    socket.on('userStatus', ({ userId, status }) => {
      console.log(`User ${userId} status changed to ${status}`);
      
      // Update user status in chats
      const { chats } = useChatStore.getState();
      const updatedChats = chats.map(chat => {
        const updatedParticipants = chat.participants.map(participant => {
          if (participant._id === userId) {
            return { ...participant, status };
          }
          return participant;
        });
        
        return { ...chat, participants: updatedParticipants };
      });
      
      useChatStore.setState({ chats: updatedChats });
    });
    
    set({ socket });
    return socket;
  },
  
  // Join a chat room
  joinChat: (chatId) => {
    const { socket, connected } = get();
    if (!socket) {
      console.warn(`Cannot join chat ${chatId}: Socket not initialized`);
      return;
    }
    
    if (!connected) {
      console.warn(`Cannot join chat ${chatId}: Socket not connected`);
      return;
    }
    
    if (chatId) {
      console.log(`Joining chat room: ${chatId}`);
      socket.emit('joinChat', chatId);
    }
  },
  
  // Send a message via socket
  sendMessage: (chatId, text) => {
    const { socket, connected } = get();
    if (!socket || !connected) {
      console.warn('Cannot send message: Socket not connected');
      return;
    }
    
    console.log(`Sending message to chat ${chatId}`);
    socket.emit('sendMessage', { chatId, text });
  },
  
  // Emit typing status
  sendTyping: (chatId, isTyping = true) => {
    const { socket, connected } = get();
    if (!socket || !connected) {
      return;
    }
    
    const eventName = isTyping ? 'typing' : 'stopTyping';
    socket.emit(eventName, { chatId });
  },
  
  // Mark message as read
  markMessageRead: (messageId) => {
    const { socket, connected } = get();
    if (!socket || !connected) {
      console.warn(`Cannot mark message ${messageId} as read: Socket not connected`);
      return;
    }
    
    // Get current user ID from auth store
    const userId = useAuthStore.getState().user?._id;
    if (!userId) {
      console.warn('Cannot mark message as read: User not authenticated');
      return;
    }
    
    console.log(`Marking message ${messageId} as read by user ${userId}`);
    socket.emit('markAsRead', { messageId, userId });
  },
  
  // Check socket connection
  checkConnection: () => {
    const { socket, connected } = get();
    if (socket && !connected) {
      console.log('Socket exists but not connected. Reconnecting...');
      
      // Attempt to reconnect
      socket.connect();
      return false;
    }
    
    return connected;
  },
  
  // Disconnect socket
  disconnect: () => {
    const { socket } = get();
    if (socket) {
      console.log('Disconnecting socket');
      socket.disconnect();
      set({ socket: null, connected: false });
    }
  }
})); 