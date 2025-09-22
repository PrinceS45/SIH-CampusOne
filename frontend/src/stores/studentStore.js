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
      const response = await api.get('/students', { 
        params: { ...get().filters, ...params } 
      });
      set({ 
        students: response.data.students || [],
        pagination: {
          page: response.data.currentPage || 1,
          limit: params.limit || get().pagination.limit,
          totalPages: response.data.totalPages || 1,
          totalStudents: response.data.totalStudents || 0
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
      // Clear current student on error
      set({ currentStudent: null, loading: false });
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
      
      // Update current student if it's the one being updated
      set((state) => ({
        currentStudent: state.currentStudent?._id === id ? response.data : state.currentStudent,
        loading: false
      }));
      
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
      
      // Update local state after successful deletion
      set((state) => ({
        students: state.students.filter(student => student._id !== id),
        pagination: {
          ...state.pagination,
          totalStudents: Math.max(0, state.pagination.totalStudents - 1)
        },
        loading: false
      }));
      
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
      
      // Update current student documents if it's the same student
      set((state) => ({
        currentStudent: state.currentStudent?._id === id 
          ? { ...state.currentStudent, documents: response.data.documents }
          : state.currentStudent,
        loading: false
      }));
      
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to upload documents';
      set({ error: message, loading: false });
      throw new Error(message);
    }
  },

  setFilters: (filters) => {
    set({ filters: { ...get().filters, ...filters } });
    // Automatically refetch students when filters change
    get().getStudents({ page: 1 });
  },
  
  clearFilters: () => {
    set({ 
      filters: {
        search: '',
        course: '',
        branch: '',
        semester: '',
        status: ''
      }
    });
    get().getStudents({ page: 1 });
  },
  
  clearError: () => set({ error: null }),
  
  clearCurrentStudent: () => set({ currentStudent: null }),
}));

export default useStudentStore;