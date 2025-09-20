// User Roles
export const USER_ROLES = {
  ADMIN: 'admin',
  STAFF: 'staff',
  STUDENT: 'student'
};

// Student Status
export const STUDENT_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  COMPLETED: 'completed',
  SUSPENDED: 'suspended'
};

// Fee Status
export const FEE_STATUS = {
  PAID: 'paid',
  PENDING: 'pending',
  PARTIAL: 'partial',
  OVERDUE: 'overdue'
};

// Payment Modes
export const PAYMENT_MODES = {
  CASH: 'cash',
  CARD: 'card',
  BANK_TRANSFER: 'bank transfer',
  UPI: 'upi',
  CHEQUE: 'cheque'
};

// Exam Types
export const EXAM_TYPES = {
  MIDTERM: 'midterm',
  FINAL: 'final',
  QUIZ: 'quiz',
  ASSIGNMENT: 'assignment'
};

// Exam Grades
export const EXAM_GRADES = {
  'A+': 4.0,
  'A': 4.0,
  'B+': 3.5,
  'B': 3.0,
  'C+': 2.5,
  'C': 2.0,
  'D': 1.0,
  'F': 0.0,
  'I': 0.0 // Incomplete
};

// Hostel Types
export const HOSTEL_TYPES = {
  BOYS: 'boys',
  GIRLS: 'girls'
};

// Room Status
export const ROOM_STATUS = {
  AVAILABLE: 'available',
  OCCUPIED: 'occupied',
  MAINTENANCE: 'maintenance',
  RESERVED: 'reserved'
};

// Course Types
export const COURSES = {
  BTECH: 'B.Tech',
  MBA: 'MBA',
  MCA: 'MCA',
  BBA: 'BBA',
  BCA: 'BCA'
};

// Branches
export const BRANCHES = {
  CS: 'Computer Science',
  EE: 'Electrical Engineering',
  ME: 'Mechanical Engineering',
  CE: 'Civil Engineering',
  EC: 'Electronics & Communication',
  IT: 'Information Technology'
};

// Semester Numbers
export const SEMESTERS = [1, 2, 3, 4, 5, 6, 7, 8];

// Default Pagination
export const PAGINATION = {
  PAGE: 1,
  LIMIT: 10,
  MAX_LIMIT: 100
};

// API Base URL
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

// Local Storage Keys
export const STORAGE_KEYS = {
  TOKEN: 'token',
  USER: 'user'
};

// Route Paths
export const ROUTE_PATHS = {
  LOGIN: '/login',
  DASHBOARD: '/dashboard',
  STUDENTS: '/students',
  FEES: '/fees',
  HOSTELS: '/hostels',
  EXAMS: '/exams',
  REPORTS: '/reports'
};

// Theme Colors
export const COLORS = {
  PRIMARY: '#3B82F6',
  SUCCESS: '#10B981',
  WARNING: '#F59E0B',
  ERROR: '#EF4444',
  INFO: '#6366F1'
};

// Date Formats
export const DATE_FORMATS = {
  DISPLAY: 'DD MMM YYYY',
  DATABASE: 'YYYY-MM-DD',
  TIME: 'HH:mm:ss',
  FULL: 'DD MMM YYYY HH:mm:ss'
};

// Export all constants
export default {
  USER_ROLES,
  STUDENT_STATUS,
  FEE_STATUS,
  PAYMENT_MODES,
  EXAM_TYPES,
  EXAM_GRADES,
  HOSTEL_TYPES,
  ROOM_STATUS,
  COURSES,
  BRANCHES,
  SEMESTERS,
  PAGINATION,
  API_BASE_URL,
  STORAGE_KEYS,
  ROUTE_PATHS,
  COLORS,
  DATE_FORMATS
};