import { create } from "zustand";
import api from "../services/api";

const useAlumniStore = create((set) => ({
  alumni: [],
  loading: false,
  error: null,

  fetchAlumni: async (params = {}) => {
    set({ loading: true, error: null });
    try {
      // Fetch users with role 'alumni'
      const response = await api.get("/auth/users", { 
        params: { ...params, role: 'alumni' } 
      });
      set({ alumni: response.data, loading: false });
    } catch (error) {
      set({ 
        error: error.response?.data?.message || "Error fetching alumni", 
        loading: false 
      });
    }
  },

  updateAlumniProfile: async (profileData) => {
    set({ loading: true, error: null });
    try {
      const response = await api.put("/auth/profile", profileData);
      set((state) => ({
        alumni: state.alumni.map(a => a._id === response.data._id ? response.data : a),
        loading: false
      }));
      return response.data;
    } catch (error) {
      set({ 
        error: error.response?.data?.message || "Error updating profile", 
        loading: false 
      });
      throw error;
    }
  }
}));

export default useAlumniStore;
