import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../services/api';

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      loading: false,
      error: null,

      login: async (credentials) => {
        set({ loading: true, error: null });
        try {
          const response = await api.post('/auth/login', credentials);
          const { token, ...user } = response.data;
          
          set({ 
            user, 
            token, 
            isAuthenticated: true, 
            loading: false 
          });
          
          localStorage.setItem('token', token);
          localStorage.setItem('user', JSON.stringify(user));
          
          return response.data;
        } catch (error) {
          const message = error.response?.data?.message || 'Login failed';
          set({ error: message, loading: false });
          throw new Error(message);
        }
      },

      register: async (userData) => {
        set({ loading: true, error: null });
        try {
          const response = await api.post('/auth/register', userData);
          const { token, ...user } = response.data;
          
          set({ 
            user, 
            token, 
            isAuthenticated: true, 
            loading: false 
          });
          
          localStorage.setItem('token', token);
          localStorage.setItem('user', JSON.stringify(user));
          
          return response.data;
        } catch (error) {
          const message = error.response?.data?.message || 'Registration failed';
          set({ error: message, loading: false });
          throw new Error(message);
        }
      },

      logout: () => {
        set({ 
          user: null, 
          token: null, 
          isAuthenticated: false 
        });
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      },

      updateProfile: async (userData) => {
        set({ loading: true, error: null });
        try {
          const response = await api.put('/auth/update', userData);
          const { token, ...user } = response.data;
          
          set({ 
            user, 
            token, 
            loading: false 
          });
          
          localStorage.setItem('token', token);
          localStorage.setItem('user', JSON.stringify(user));
          
          return response.data;
        } catch (error) {
          const message = error.response?.data?.message || 'Update failed';
          set({ error: message, loading: false });
          throw new Error(message);
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ 
        user: state.user, 
        token: state.token, 
        isAuthenticated: state.isAuthenticated 
      }),
    }
  )
);

export default useAuthStore;