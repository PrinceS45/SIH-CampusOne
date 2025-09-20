import { create } from 'zustand';
import api from '../services/api';

const useHostelStore = create((set, get) => ({
  hostels: [],
  currentHostel: null,
  rooms: [],
  loading: false,
  error: null,
  occupancyStats: [],

  getHostels: async () => {
    set({ loading: true, error: null });
    try {
      const response = await api.get('/hostels');
      set({ 
        hostels: response.data, 
        loading: false 
      });
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch hostels';
      set({ error: message, loading: false });
      throw new Error(message);
    }
  },

  getHostel: async (id) => {
    set({ loading: true, error: null });
    try {
      const response = await api.get(`/hostels/${id}`);
      set({ 
        currentHostel: response.data, 
        loading: false 
      });
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch hostel';
      set({ error: message, loading: false });
      throw new Error(message);
    }
  },

  createHostel: async (hostelData) => {
    set({ loading: true, error: null });
    try {
      const response = await api.post('/hostels', hostelData);
      set({ loading: false });
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to create hostel';
      set({ error: message, loading: false });
      throw new Error(message);
    }
  },

  updateHostel: async (id, hostelData) => {
    set({ loading: true, error: null });
    try {
      const response = await api.put(`/hostels/${id}`, hostelData);
      set({ loading: false });
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update hostel';
      set({ error: message, loading: false });
      throw new Error(message);
    }
  },

  deleteHostel: async (id) => {
    set({ loading: true, error: null });
    try {
      await api.delete(`/hostels/${id}`);
      set({ loading: false });
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to delete hostel';
      set({ error: message, loading: false });
      throw new Error(message);
    }
  },

  getRooms: async (hostelId, params = {}) => {
    set({ loading: true, error: null });
    try {
      const response = await api.get(`/hostels/${hostelId}/rooms`, { params });
      set({ 
        rooms: response.data, 
        loading: false 
      });
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch rooms';
      set({ error: message, loading: false });
      throw new Error(message);
    }
  },

  createRoom: async (hostelId, roomData) => {
    set({ loading: true, error: null });
    try {
      const response = await api.post(`/hostels/${hostelId}/rooms`, roomData);
      set({ loading: false });
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to create room';
      set({ error: message, loading: false });
      throw new Error(message);
    }
  },

  updateRoom: async (roomId, roomData) => {
    set({ loading: true, error: null });
    try {
      const response = await api.put(`/hostels/rooms/${roomId}`, roomData);
      set({ loading: false });
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update room';
      set({ error: message, loading: false });
      throw new Error(message);
    }
  },

  deleteRoom: async (roomId) => {
    set({ loading: true, error: null });
    try {
      await api.delete(`/hostels/rooms/${roomId}`);
      set({ loading: false });
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to delete room';
      set({ error: message, loading: false });
      throw new Error(message);
    }
  },

  allocateRoom: async (allocationData) => {
    set({ loading: true, error: null });
    try {
      const response = await api.post('/hostels/allocate', allocationData);
      set({ loading: false });
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to allocate room';
      set({ error: message, loading: false });
      throw new Error(message);
    }
  },

  deallocateRoom: async (studentId) => {
    set({ loading: true, error: null });
    try {
      const response = await api.post('/hostels/deallocate', { studentId });
      set({ loading: false });
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to deallocate room';
      set({ error: message, loading: false });
      throw new Error(message);
    }
  },

  getOccupancyStats: async () => {
    set({ loading: true, error: null });
    try {
      const response = await api.get('/hostels/stats/occupancy');
      set({ 
        occupancyStats: response.data, 
        loading: false 
      });
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch occupancy stats';
      set({ error: message, loading: false });
      throw new Error(message);
    }
  },

  clearError: () => set({ error: null }),
}));

export default useHostelStore;