import { create } from 'zustand';
import api from '../services/api';

const useExamStore = create((set, get) => ({
  exams: [],
  currentExam: null,
  loading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 10,
    totalPages: 1,
    totalRecords: 0
  },
  filters: {
    studentId: '',
    examType: '',
    subject: '',
    course: '',
    semester: ''
  },
  performanceStats: [],

  getExams: async (params = {}) => {
    set({ loading: true, error: null });
    try {
      const response = await api.get('/exams', { params });
      set({ 
        exams: response.data.exams,
        pagination: {
          page: response.data.currentPage,
          limit: params.limit || get().pagination.limit,
          totalPages: response.data.totalPages,
          totalRecords: response.data.totalRecords
        },
        loading: false 
      });
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch exams';
      set({ error: message, loading: false });
      throw new Error(message);
    }
  },

  getStudentExams: async (studentId) => {
    set({ loading: true, error: null });
    try {
      const response = await api.get(`/exams/student/${studentId}`);
      set({ loading: false });
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch student exams';
      set({ error: message, loading: false });
      throw new Error(message);
    }
  },

  getExam: async (id) => {
    set({ loading: true, error: null });
    try {
      const response = await api.get(`/exams/${id}`);
      set({ 
        currentExam: response.data, 
        loading: false 
      });
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch exam';
      set({ error: message, loading: false });
      throw new Error(message);
    }
  },

  createExam: async (examData) => {
    set({ loading: true, error: null });
    try {
      const response = await api.post('/exams', examData);
      set({ loading: false });
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to create exam';
      set({ error: message, loading: false });
      throw new Error(message);
    }
  },

  updateExam: async (id, examData) => {
    set({ loading: true, error: null });
    try {
      const response = await api.put(`/exams/${id}`, examData);
      set({ loading: false });
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update exam';
      set({ error: message, loading: false });
      throw new Error(message);
    }
  },

  deleteExam: async (id) => {
    set({ loading: true, error: null });
    try {
      await api.delete(`/exams/${id}`);
      set({ loading: false });
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to delete exam';
      set({ error: message, loading: false });
      throw new Error(message);
    }
  },

  getPerformanceStats: async (params = {}) => {
    set({ loading: true, error: null });
    try {
      const response = await api.get('/exams/stats/performance', { params });
      set({ 
        performanceStats: response.data, 
        loading: false 
      });
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch performance stats';
      set({ error: message, loading: false });
      throw new Error(message);
    }
  },

  setFilters: (filters) => set({ filters: { ...get().filters, ...filters } }),
  clearError: () => set({ error: null }),
}));

export default useExamStore;