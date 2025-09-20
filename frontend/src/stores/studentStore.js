import { create } from 'zustand';
import api from '../services/api';

const useStudentStore = create((set, get) => ({
  students: [],
  currentStudent: null,
  loading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 10,
    totalPages: 1,
    totalStudents: 0
  },
  filters: {
    search: '',
    course: '',
    branch: '',
    semester: '',
    status: ''
  },

  getStudents: async (params = {}) => {
    set({ loading: true, error: null });
    try {
      const response = await api.get('/students', { params });
      set({ 
        students: response.data.students,
        pagination: {
          page: response.data.currentPage,
          limit: params.limit || get().pagination.limit,
          totalPages: response.data.totalPages,
          totalStudents: response.data.totalStudents
        },
        loading: false 
      });
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch students';
      set({ error: message, loading: false });
      throw new Error(message);
    }
  },

  getStudent: async (id) => {
    set({ loading: true, error: null });
    try {
      const response = await api.get(`/students/${id}`);
      set({ 
        currentStudent: response.data, 
        loading: false 
      });
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch student';
      set({ error: message, loading: false });
      throw new Error(message);
    }
  },

  createStudent: async (studentData) => {
    set({ loading: true, error: null });
    try {
      const response = await api.post('/students', studentData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      set({ loading: false });
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to create student';
      set({ error: message, loading: false });
      throw new Error(message);
    }
  },

  updateStudent: async (id, studentData) => {
    set({ loading: true, error: null });
    try {
      const response = await api.put(`/students/${id}`, studentData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      set({ loading: false });
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update student';
      set({ error: message, loading: false });
      throw new Error(message);
    }
  },

  deleteStudent: async (id) => {
    set({ loading: true, error: null });
    try {
      await api.delete(`/students/${id}`);
      set({ loading: false });
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to delete student';
      set({ error: message, loading: false });
      throw new Error(message);
    }
  },

  uploadDocuments: async (id, documents) => {
    set({ loading: true, error: null });
    try {
      const formData = new FormData();
      documents.forEach((doc) => {
        formData.append('documents', doc);
      });
      
      const response = await api.post(`/students/${id}/documents`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      set({ loading: false });
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to upload documents';
      set({ error: message, loading: false });
      throw new Error(message);
    }
  },

  setFilters: (filters) => set({ filters: { ...get().filters, ...filters } }),
  clearError: () => set({ error: null }),
}));

export default useStudentStore;