import { format, parseISO, differenceInYears, isBefore, isAfter, addDays } from 'date-fns';

// Format currency (Indian Rupees)
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
};

// Format date
export const formatDate = (date, formatStr = 'dd MMM yyyy') => {
  if (!date) return '-';
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, formatStr);
};

// Calculate age from date of birth
export const calculateAge = (dateOfBirth) => {
  if (!dateOfBirth) return 0;
  const dob = typeof dateOfBirth === 'string' ? parseISO(dateOfBirth) : dateOfBirth;
  return differenceInYears(new Date(), dob);
};

// Validate email format
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Validate phone number (Indian format)
export const validatePhone = (phone) => {
  const phoneRegex = /^[6-9]\d{9}$/;
  return phoneRegex.test(phone.replace(/\D/g, ''));
};

// Generate random ID
export const generateId = (length = 8) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// Debounce function for search inputs
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Get initial from name
export const getInitials = (name) => {
  if (!name) return '';
  return name
    .split(' ')
    .map(word => word.charAt(0).toUpperCase())
    .join('')
    .slice(0, 2);
};

// Check if value is empty
export const isEmpty = (value) => {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string') return value.trim() === '';
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object') return Object.keys(value).length === 0;
  return false;
};

// Deep clone object
export const deepClone = (obj) => {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj.getTime());
  if (obj instanceof Array) return obj.map(item => deepClone(item));
  if (typeof obj === 'object') {
    const clonedObj = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        clonedObj[key] = deepClone(obj[key]);
      }
    }
    return clonedObj;
  }
};

// File size formatter
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Get status color
export const getStatusColor = (status) => {
  const statusColors = {
    active: 'green',
    inactive: 'red',
    completed: 'blue',
    suspended: 'orange',
    paid: 'green',
    pending: 'yellow',
    partial: 'blue',
    overdue: 'red',
    available: 'green',
    occupied: 'blue',
    maintenance: 'orange',
    reserved: 'purple',
    pass: 'green',
    fail: 'red'
  };
  return statusColors[status] || 'gray';
};

// Calculate percentage
export const calculatePercentage = (part, total) => {
  if (total === 0) return 0;
  return Math.round((part / total) * 100);
};

// Generate array of years
export const generateYearRange = (startYear, endYear) => {
  const years = [];
  for (let year = startYear; year <= endYear; year++) {
    years.push(year);
  }
  return years;
};

// Check if date is in future
export const isFutureDate = (date) => {
  return isAfter(new Date(date), new Date());
};

// Check if date is in past
export const isPastDate = (date) => {
  return isBefore(new Date(date), new Date());
};

// Add days to date
export const addDaysToDate = (date, days) => {
  return addDays(new Date(date), days);
};

// Get current academic year
export const getCurrentAcademicYear = () => {
  const currentYear = new Date().getFullYear();
  const nextYear = currentYear + 1;
  return `${currentYear}-${nextYear}`;
};

// Parse error message from response
export const parseErrorMessage = (error) => {
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  if (error.response?.data?.error) {
    return error.response.data.error;
  }
  if (error.message) {
    return error.message;
  }
  return 'An unexpected error occurred';
};

// Export all helpers
export default {
  formatCurrency,
  formatDate,
  calculateAge,
  validateEmail,
  validatePhone,
  generateId,
  debounce,
  getInitials,
  isEmpty,
  deepClone,
  formatFileSize,
  getStatusColor,
  calculatePercentage,
  generateYearRange,
  isFutureDate,
  isPastDate,
  addDaysToDate,
  getCurrentAcademicYear,
  parseErrorMessage
};