import { create } from 'zustand';
import api from '../services/api';

const useDashboardStore = create((set, get) => ({
  stats: null,
  upcomingFees: [],
  recentActivities: {},
  loading: false,
  error: null,

  getDashboardStats: async () => {
    set({ loading: true, error: null });
    try {
      const response = await api.get('/dashboard/stats');
      set({ 
        stats: response.data, 
        loading: false 
      });
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch dashboard stats';
      set({ error: message, loading: false });
      throw new Error(message);
    }
  },

  getUpcomingFees: async () => {
    set({ loading: true, error: null });
    try {
      const response = await api.get('/dashboard/upcoming-fees');
      set({ 
        upcomingFees: response.data, 
        loading: false 
      });
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch upcoming fees';
      set({ error: message, loading: false });
      throw new Error(message);
    }
  },

  getRecentActivities: async () => {
    set({ loading: true, error: null });
    try {
      const response = await api.get('/dashboard/recent-activities');
      set({ 
        recentActivities: response.data, 
        loading: false 
      });
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch recent activities';
      set({ error: message, loading: false });
      throw new Error(message);
    }
  },

  clearError: () => set({ error: null }),
}));

export default useDashboardStore;