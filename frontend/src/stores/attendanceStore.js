import { create } from "zustand";
import api from "../services/api";

const useAttendanceStore = create((set, get) => ({
  attendanceRecords: [],
  usersToMark: [], // Students or Staff to be marked
  myAttendance: [],
  loading: false,
  error: null,

  // Fetch students for marking
  fetchStudentsForMarking: async (filters, date) => {
    set({ loading: true, error: null });
    try {
      const response = await api.get("/attendance/students", { params: { ...filters, date } });
      set({ usersToMark: response.data, loading: false });
    } catch (error) {
      set({ 
        error: error.response?.data?.message || "Error fetching students", 
        loading: false 
      });
    }
  },

  // Fetch staff for marking (Admin only)
  fetchStaffForMarking: async (date) => {
    set({ loading: true, error: null });
    try {
      const response = await api.get("/attendance/staff-list", { params: { date } });
      // Map staff to a consistent format for the UI
      const formattedStaff = response.data.map(s => ({
        _id: s._id,
        name: s.name,
        department: s.department,
        photo: s.profilePicture,
        existingStatus: s.existingStatus
      }));
      set({ usersToMark: formattedStaff, loading: false });
    } catch (error) {
      set({ 
        error: error.response?.data?.message || "Error fetching staff", 
        loading: false 
      });
    }
  },

  // Unmark attendance (Delete)
  unmarkAttendance: async (memberData) => {
    set({ loading: true, error: null });
    try {
      await api.post("/attendance/unmark", memberData);
      set({ loading: false });
    } catch (error) {
      set({ 
        error: error.response?.data?.message || "Error unmarking attendance", 
        loading: false 
      });
      throw error;
    }
  },

  // Bulk mark attendance
  submitAttendance: async (attendanceData, date, role) => {
    set({ loading: true, error: null });
    try {
      await api.post("/attendance", { attendanceData, date, role });
      set({ loading: false });
    } catch (error) {
      set({ 
        error: error.response?.data?.message || "Error submitting attendance", 
        loading: false 
      });
      throw error;
    }
  },

  // Fetch attendance history with filters
  fetchAttendanceHistory: async (filters) => {
    set({ loading: true, error: null });
    try {
      const response = await api.get("/attendance", { params: filters });
      set({ attendanceRecords: response.data, loading: false });
    } catch (error) {
      set({ 
        error: error.response?.data?.message || "Error fetching history", 
        loading: false 
      });
    }
  },

  // Fetch personal history
  fetchMyAttendance: async () => {
    set({ loading: true, error: null });
    try {
      const response = await api.get("/attendance/my");
      set({ myAttendance: response.data, loading: false });
    } catch (error) {
      set({ 
        error: error.response?.data?.message || "Error fetching your attendance", 
        loading: false 
      });
    }
  },

  clearError: () => set({ error: null })
}));

export default useAttendanceStore;
