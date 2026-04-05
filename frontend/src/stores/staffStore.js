import { create } from "zustand";
import api from "../services/api";

const useStaffStore = create((set, get) => ({
    staffMembers: [],
    staffDetails: null,
    stats: null,
    loading: false,
    error: null,
    totalPages: 1,
    currentPage: 1,
    totalItems: 0,

    fetchStaff: async (params = {}) => {
        set({ loading: true, error: null });
        try {
            const response = await api.get("/staff", { params });
            set({ 
                staffMembers: response.data.staff,
                totalPages: response.data.totalPages,
                currentPage: response.data.currentPage,
                totalItems: response.data.totalStaff,
                loading: false 
            });
        } catch (error) {
            set({ 
                error: error.response?.data?.message || "Error fetching staff members", 
                loading: false 
            });
        }
    },

    fetchStaffById: async (id) => {
        set({ loading: true, error: null });
        try {
            const response = await api.get(`/staff/${id}`);
            set({ staffDetails: response.data, loading: false });
        } catch (error) {
            set({ 
                error: error.response?.data?.message || "Error fetching staff details", 
                loading: false 
            });
        }
    },

    createStaff: async (formData) => {
        set({ loading: true, error: null });
        try {
            // Using multipart/form-data for photo uploads
            const response = await api.post("/staff", formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            set(state => ({ 
                staffMembers: [response.data, ...state.staffMembers],
                loading: false 
            }));
            return response.data;
        } catch (error) {
            const msg = error.response?.data?.message || "Error creating staff profile";
            set({ error: msg, loading: false });
            throw new Error(msg);
        }
    },

    updateStaff: async (id, formData) => {
        set({ loading: true, error: null });
        try {
            const response = await api.put(`/staff/${id}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            set(state => ({
                staffMembers: state.staffMembers.map(s => s._id === id ? response.data : s),
                staffDetails: response.data,
                loading: false
            }));
            return response.data;
        } catch (error) {
            const msg = error.response?.data?.message || "Error updating staff profile";
            set({ error: msg, loading: false });
            throw new Error(msg);
        }
    },

    deleteStaff: async (id) => {
        set({ loading: true, error: null });
        try {
            await api.delete(`/staff/${id}`);
            set(state => ({
                staffMembers: state.staffMembers.filter(s => s._id !== id),
                loading: false
            }));
        } catch (error) {
            set({ 
                error: error.response?.data?.message || "Error deleting staff member", 
                loading: false 
            });
        }
    },

    fetchStaffStats: async () => {
        set({ loading: true });
        try {
            const response = await api.get("/staff/stats/overview");
            set({ stats: response.data, loading: false });
        } catch (error) {
            set({ loading: false });
        }
    },

    clearError: () => set({ error: null }),
    clearDetails: () => set({ staffDetails: null })
}));

export default useStaffStore;
