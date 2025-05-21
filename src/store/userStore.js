import { create } from 'zustand';
import { toast } from 'react-toastify';
import api from '../utils/api';

export const useUserStore = create((set) => ({
  users: [],
  searchResults: [],
  loading: false,
  error: null,
  
  // Search users
  searchUsers: async (searchTerm) => {
    if (!searchTerm.trim()) {
      set({ searchResults: [] });
      return [];
    }
    
    set({ loading: true });
    try {
      const response = await api.get(`/users/search?term=${encodeURIComponent(searchTerm)}`);
      set({ searchResults: response.data, loading: false });
      return response.data;
    } catch (error) {
      const message = error.response?.data?.error || 'Search failed';
      set({ error: message, loading: false });
      toast.error(message);
      return [];
    }
  },
  
  // Get user by ID
  getUserById: async (userId) => {
    set({ loading: true });
    try {
      const response = await api.get(`/users/${userId}`);
      
      // Add to users cache
      set(state => {
        const userExists = state.users.some(user => user._id === userId);
        if (!userExists) {
          return { 
            users: [...state.users, response.data],
            loading: false 
          };
        }
        return { loading: false };
      });
      
      return response.data;
    } catch (error) {
      const message = error.response?.data?.error || 'Failed to fetch user';
      set({ error: message, loading: false });
      toast.error(message);
      return null;
    }
  },
  
  // Clear search results
  clearSearchResults: () => {
    set({ searchResults: [] });
  }
})); 