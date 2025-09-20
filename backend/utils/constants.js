// User Roles
export const USER_ROLES = {
  ADMIN: 'admin',
  STAFF: 'staff',
  STUDENT: 'student'
};
// Log Modules
export const LOG_MODULES = {
  STUDENT: 'student',
  FEE: 'fee',
  EXAM: 'exam',
  HOSTEL: 'hostel',
  USER: 'user',
  AUTH: 'auth',
  SYSTEM: 'system' // Added this
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

// Log Actions
export const LOG_ACTIONS = {
  CREATE: 'create',
  UPDATE: 'update',
  DELETE: 'delete',
  LOGIN: 'login',
  LOGOUT: 'logout',
  FEE_PAYMENT: 'fee_payment',
  EXAM_UPDATE: 'exam_update',
  HOSTEL_ALLOCATION: 'hostel_allocation'
};

// Log Modules


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

// File Upload Limits
export const UPLOAD_LIMITS = {
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_FILE_TYPES: ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf']
};

// Email Templates
export const EMAIL_TEMPLATES = {
  WELCOME: 'welcome',
  FEE_RECEIPT: 'fee_receipt',
  EXAM_RESULT: 'exam_result',
  PASSWORD_RESET: 'password_reset'
};

// Response Messages
export const RESPONSE_MESSAGES = {
  // Success Messages
  SUCCESS: 'Operation completed successfully',
  CREATED: 'Resource created successfully',
  UPDATED: 'Resource updated successfully',
  DELETED: 'Resource deleted successfully',
  LOGIN_SUCCESS: 'Login successful',
  LOGOUT_SUCCESS: 'Logout successful',
  
  // Error Messages
  ERROR: 'An error occurred',
  NOT_FOUND: 'Resource not found',
  UNAUTHORIZED: 'Unauthorized access',
  FORBIDDEN: 'Access forbidden',
  VALIDATION_ERROR: 'Validation failed',
  DUPLICATE_ERROR: 'Duplicate entry found',
  SERVER_ERROR: 'Internal server error',
  
  // Auth Messages
  INVALID_CREDENTIALS: 'Invalid email or password',
  TOKEN_EXPIRED: 'Token has expired',
  TOKEN_INVALID: 'Invalid token',
  PASSWORD_MISMATCH: 'Passwords do not match',
  
  // Validation Messages
  REQUIRED_FIELD: 'This field is required',
  INVALID_EMAIL: 'Please enter a valid email address',
  INVALID_PHONE: 'Please enter a valid phone number',
  MIN_LENGTH: 'Value is too short',
  MAX_LENGTH: 'Value is too long',
  INVALID_DATE: 'Please enter a valid date'
};

// HTTP Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  SERVER_ERROR: 500
};

// Date Formats
export const DATE_FORMATS = {
  DISPLAY: 'DD MMM YYYY',
  DATABASE: 'YYYY-MM-DD',
  TIME: 'HH:mm:ss',
  FULL: 'DD MMM YYYY HH:mm:ss'
};

// Currency Configuration
export const CURRENCY = {
  SYMBOL: '₹',
  CODE: 'INR',
  LOCALE: 'en-IN'
};

// Academic Configuration
export const ACADEMIC_CONFIG = {
  PASS_PERCENTAGE: 35,
  MAX_ATTEMPTS: 3,
  GRACE_MARKS: 5,
  ATTENDANCE_PERCENTAGE: 75
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
  LOG_ACTIONS,
  LOG_MODULES,
  COURSES,
  BRANCHES,
  SEMESTERS,
  PAGINATION,
  UPLOAD_LIMITS,
  EMAIL_TEMPLATES,
  RESPONSE_MESSAGES,
  HTTP_STATUS,
  DATE_FORMATS,
  CURRENCY,
  ACADEMIC_CONFIG
};