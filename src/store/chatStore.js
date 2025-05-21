import { create } from 'zustand';
import { toast } from 'react-toastify';
import api from '../utils/api';

export const useChatStore = create((set, get) => ({
  chats: [],
  currentChat: null,
  messages: [],
  loading: false,
  error: null,
  isTyping: {},
  unreadCounts: {},

  // Get all chats for the current user
  getChats: async () => {
    set({ loading: true });
    try {
      const response = await api.get('/chats');
      set({ chats: response.data, loading: false });
      return response.data;
    } catch (error) {
      const message = error.response?.data?.error || 'Failed to fetch chats';
      set({ error: message, loading: false });
      toast.error(message);
      return [];
    }
  },

  // Get a specific chat by ID
  getChatById: async (chatId) => {
    set({ loading: true });
    try {
      const response = await api.get(`/chats/${chatId}`);
      set({ currentChat: response.data, loading: false });
      return response.data;
    } catch (error) {
      const message = error.response?.data?.error || 'Failed to fetch chat';
      set({ error: message, loading: false });
      toast.error(message);
      return null;
    }
  },

  // Create a new chat
  createChat: async (chatData) => {
    set({ loading: true });
    try {
      const response = await api.post('/chats', chatData);
      const newChat = response.data;
      
      set(state => ({ 
        chats: [newChat, ...state.chats], 
        loading: false 
      }));
      
      toast.success(chatData.isGroup ? 'Group chat created!' : 'Chat started!');
      return newChat;
    } catch (error) {
      const message = error.response?.data?.error || 'Failed to create chat';
      set({ error: message, loading: false });
      toast.error(message);
      return null;
    }
  },

  // Update chat settings
  updateChat: async (chatId, chatData) => {
    set({ loading: true });
    try {
      const response = await api.put(`/chats/${chatId}`, chatData);
      const updatedChat = response.data;
      
      set(state => ({ 
        chats: state.chats.map(chat => 
          chat._id === chatId ? updatedChat : chat
        ),
        currentChat: state.currentChat?._id === chatId ? updatedChat : state.currentChat,
        loading: false 
      }));
      
      toast.success('Chat updated!');
      return updatedChat;
    } catch (error) {
      const message = error.response?.data?.error || 'Failed to update chat';
      set({ error: message, loading: false });
      toast.error(message);
      return null;
    }
  },

  // Add participants to group chat
  addParticipants: async (chatId, participantIds) => {
    set({ loading: true });
    try {
      const response = await api.post(`/chats/${chatId}/participants`, {
        participants: participantIds
      });
      
      const updatedChat = response.data;
      
      set(state => ({ 
        chats: state.chats.map(chat => 
          chat._id === chatId ? updatedChat : chat
        ),
        currentChat: state.currentChat?._id === chatId ? updatedChat : state.currentChat,
        loading: false 
      }));
      
      toast.success('Participants added!');
      return updatedChat;
    } catch (error) {
      const message = error.response?.data?.error || 'Failed to add participants';
      set({ error: message, loading: false });
      toast.error(message);
      return null;
    }
  },

  // Remove participant from group chat
  removeParticipant: async (chatId, participantId) => {
    set({ loading: true });
    try {
      const response = await api.delete(`/chats/${chatId}/participants/${participantId}`);
      const updatedChat = response.data;
      
      set(state => ({ 
        chats: state.chats.map(chat => 
          chat._id === chatId ? updatedChat : chat
        ),
        currentChat: state.currentChat?._id === chatId ? updatedChat : state.currentChat,
        loading: false 
      }));
      
      toast.success('Participant removed');
      return updatedChat;
    } catch (error) {
      const message = error.response?.data?.error || 'Failed to remove participant';
      set({ error: message, loading: false });
      toast.error(message);
      return null;
    }
  },

  // Get messages for a chat
  getMessages: async (chatId) => {
    set({ loading: true });
    try {
      const response = await api.get(`/chats/${chatId}/messages`);
      set({ messages: response.data, loading: false });
      
      // Clear unread count for this chat
      set(state => ({
        unreadCounts: {
          ...state.unreadCounts,
          [chatId]: 0
        }
      }));
      
      return response.data;
    } catch (error) {
      const message = error.response?.data?.error || 'Failed to fetch messages';
      set({ error: message, loading: false });
      toast.error(message);
      return [];
    }
  },

  // Send a message
  sendMessage: async (chatId, text) => {
    try {
      const response = await api.post(`/chats/${chatId}/messages`, { chatId, text });
      const newMessage = response.data;
      
      // Optimistically update UI
      set(state => ({ 
        messages: [...state.messages, newMessage] 
      }));
      
      return newMessage;
    } catch (error) {
      const message = error.response?.data?.error || 'Failed to send message';
      toast.error(message);
      return null;
    }
  },

  // Mark message as read
  markAsRead: async (messageId) => {
    try {
      await api.put(`/messages/${messageId}/read`);
      return true;
    } catch (error) {
      console.error('Failed to mark message as read:', error);
      return false;
    }
  },

  // Delete message
  deleteMessage: async (messageId) => {
    try {
      await api.delete(`/messages/${messageId}`);
      
      // Remove from messages list
      set(state => ({ 
        messages: state.messages.filter(message => message._id !== messageId) 
      }));
      
      toast.success('Message deleted');
      return true;
    } catch (error) {
      const message = error.response?.data?.error || 'Failed to delete message';
      toast.error(message);
      return false;
    }
  },

  // Handle new message received via socket
  addNewMessage: (message) => {
    const { currentChat, messages, chats } = get();
    
    try {
      console.log('Processing new message:', message);
      
      // Update message list if in current chat
      if (currentChat && message.chatId === currentChat._id) {
        console.log('Adding message to current chat view');
        
        // Check if message already exists to avoid duplicates
        const messageExists = messages.some(msg => msg._id === message._id);
        if (messageExists) {
          console.log('Message already exists, skipping');
          return;
        }
        
        set({ messages: [...messages, message] });
      } else {
        // Increment unread count for other chats
        console.log(`Incrementing unread count for chat ${message.chatId}`);
        set(state => ({
          unreadCounts: {
            ...state.unreadCounts,
            [message.chatId]: (state.unreadCounts[message.chatId] || 0) + 1
          }
        }));
        
        // Play notification sound if implemented
        const audio = new Audio('/notification.mp3');
        audio.play().catch(err => console.log('Error playing notification sound:', err));
      }

      // Check if the chat exists in the list
      const chatExists = chats.some(chat => chat._id === message.chatId);
      
      if (!chatExists) {
        console.log('Chat not in list, fetching updated chat list');
        // Fetch updated chat list to ensure we have the latest data
        get().getChats();
        return;
      }

      // Update last message in chat list and resort
      console.log('Updating chat list with new message');
      set(state => ({
        chats: state.chats.map(chat => {
          if (chat._id === message.chatId) {
            return { ...chat, lastMessage: message };
          }
          return chat;
        }).sort((a, b) => {
          // Move chat with new message to top
          if (a._id === message.chatId) return -1;
          if (b._id === message.chatId) return 1;
          
          // Otherwise sort by timestamp of last message
          const aTime = a.lastMessage?.createdAt || a.updatedAt || 0;
          const bTime = b.lastMessage?.createdAt || b.updatedAt || 0;
          return new Date(bTime) - new Date(aTime);
        })
      }));
    } catch (error) {
      console.error('Error processing new message in store:', error);
    }
  },

  // Set user typing status
  setUserTyping: (chatId, userId, isTyping) => {
    set(state => ({
      isTyping: {
        ...state.isTyping,
        [chatId]: isTyping ? 
          [...(state.isTyping[chatId] || []), userId] : 
          (state.isTyping[chatId] || []).filter(id => id !== userId)
      }
    }));
  },

  // Clear current chat
  clearCurrentChat: () => {
    set({ currentChat: null, messages: [] });
  },

  // Set unread count for a chat
  setUnreadCount: (chatId, count) => {
    set(state => ({
      unreadCounts: {
        ...state.unreadCounts,
        [chatId]: count
      }
    }));
  }
})); 