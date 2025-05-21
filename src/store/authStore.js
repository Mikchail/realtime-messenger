import { create } from 'zustand';
import axios from 'axios';
import { toast } from 'react-toastify';
import api from '../utils/api';

export const useAuthStore = create((set, get) => ({
  user: null,
  token: localStorage.getItem('token'),
  isLoggedIn: false,
  loading: false,
  error: null,

  // Check if user is authenticated
  checkAuth: async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      set({ isLoggedIn: false, user: null });
      return false;
    }

    try {
      const response = await api.get('/auth/me');
      set({ user: response.data, isLoggedIn: true, token });
      return true;
    } catch (error) {
      localStorage.removeItem('token');
      set({ isLoggedIn: false, user: null, token: null });
      return false;
    }
  },

  // Register a new user
  register: async (userData) => {
    set({ loading: true, error: null });
    try {
      const response = await api.post('/auth/register', userData);
      const { token, user } = response.data;
      
      localStorage.setItem('token', token);
      set({ user, token, isLoggedIn: true, loading: false });
      toast.success('Registration successful!');
      return true;
    } catch (error) {
      const message = error.response?.data?.error || 'Registration failed';
      set({ 
        error: message, 
        loading: false 
      });
      toast.error(message);
      return false;
    }
  },

  // Login user
  login: async (credentials) => {
    set({ loading: true, error: null });
    try {
      const response = await api.post('/auth/login', credentials);
      const { token, user } = response.data;
      
      localStorage.setItem('token', token);
      set({ user, token, isLoggedIn: true, loading: false });
      toast.success('Login successful!');
      return true;
    } catch (error) {
      const message = error.response?.data?.error || 'Login failed';
      set({ 
        error: message, 
        loading: false 
      });
      toast.error(message);
      return false;
    }
  },

  // Logout user
  logout: () => {
    localStorage.removeItem('token');
    set({ user: null, token: null, isLoggedIn: false });
    toast.info('You have been logged out');
  },

  // Update user profile
  updateProfile: async (userData) => {
    set({ loading: true, error: null });
    try {
      const response = await api.put('/users/me', userData);
      set({ user: response.data, loading: false });
      toast.success('Profile updated successfully!');
      return true;
    } catch (error) {
      const message = error.response?.data?.error || 'Failed to update profile';
      set({ 
        error: message, 
        loading: false 
      });
      toast.error(message);
      return false;
    }
  },
})); 