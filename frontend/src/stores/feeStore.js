import { create } from 'zustand';
import api from '../services/api';

const useFeeStore = create((set, get) => ({
  fees: [],
  currentFee: null,
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
    status: '',
    startDate: '',
    endDate: ''
  },
  stats: null,

getFees: async (params = {}) => {
  set({ loading: true, error: null });
  try {
    const response = await api.get('/fees', { params });
    
    console.log('Fees API response:', response.data);
    
    set({ 
      fees: response.data.fees || [],
      pagination: {
        page: response.data.currentPage || 1,
        limit: params.limit || get().pagination.limit,
        totalPages: response.data.totalPages || 1,
        totalRecords: response.data.totalRecords || 0
      },
      loading: false 
    });
  } catch (error) {
    console.error('Error fetching fees:', error);
    
    // Check if it's the specific pagination error
    if (error.response?.data?.message?.includes('paginate')) {
      console.log('Pagination error detected, trying fallback approach');
      
      // Try to get fees without pagination as fallback
      try {
        const response = await api.get('/fees/all'); // You'd need to create this endpoint
        set({ 
          fees: response.data || [],
          pagination: {
            page: 1,
            limit: 10,
            totalPages: 1,
            totalRecords: response.data.length || 0
          },
          loading: false 
        });
      } catch (fallbackError) {
        const message = 'Failed to fetch fees';
        set({ error: message, loading: false, fees: [] });
      }
    } else {
      const message = error.response?.data?.message || 'Failed to fetch fees';
      set({ error: message, loading: false, fees: [] });
    }
  }
},

  getStudentFees: async (studentId) => {
    set({ loading: true, error: null });
    try {
      const response = await api.get(`/fees/student/${studentId}`);
      set({ loading: false });
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch student fees';
      set({ error: message, loading: false });
      throw new Error(message);
    }
  },

 getFee: async (id) => {
  set({ loading: true, error: null });
  try {
    const response = await api.get(`/fees/${id}`);
    set({ 
      currentFee: response.data, 
      loading: false 
    });
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || 'Failed to fetch fee';
    set({ error: message, loading: false });
    throw new Error(message);
  }
},

 createFee: async (feeData) => {
  set({ loading: true, error: null });
  try {
    const response = await api.post('/fees', feeData);
    // Add the new fee to the local state
    set((state) => ({
      fees: [response.data, ...state.fees],
      loading: false
    }));
    return response.data; // Make sure this returns the created fee with receipt data
  } catch (error) {
    const message = error.response?.data?.message || 'Failed to create fee';
    set({ error: message, loading: false });
    throw new Error(message);
  }
},

  updateFee: async (id, feeData) => {
    set({ loading: true, error: null });
    try {
      const response = await api.put(`/fees/${id}`, feeData);
      set({ loading: false });
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update fee';
      set({ error: message, loading: false });
      throw new Error(message);
    }
  },

  deleteFee: async (id) => {
    set({ loading: true, error: null });
    try {
      await api.delete(`/fees/${id}`);
      set({ loading: false });
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to delete fee';
      set({ error: message, loading: false });
      throw new Error(message);
    }
  },

  getFeeStats: async (params = {}) => {
    set({ loading: true, error: null });
    try {
      const response = await api.get('/fees/stats/overview', { params });
      set({ 
        stats: response.data, 
        loading: false 
      });
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch fee stats';
      set({ error: message, loading: false });
      throw new Error(message);
    }
  },

  setFilters: (filters) => set({ filters: { ...get().filters, ...filters } }),
  clearError: () => set({ error: null }),
}));

export default useFeeStore;