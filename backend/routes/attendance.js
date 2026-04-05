import express from 'express';
import { auth, authorize } from '../middleware/auth.js';
import { 
  markAttendance, 
  getStudentsForAttendance, 
  getStaffForAttendance, 
  getAttendanceRecords, 
  getMyAttendance,
  unmarkAttendance
} from '../controllers/attendanceController.js';

const router = express.Router();

// @route POST api/attendance
// @desc Bulk mark attendance
// @access Private (Admin/Staff)
router.post('/', auth, authorize('admin', 'staff'), markAttendance);

// @route GET api/attendance/students
// @desc Get students for marking attendance
// @access Private (Admin/Staff)
router.get('/students', auth, authorize('admin', 'staff'), getStudentsForAttendance);

// @route GET api/attendance/staff-list
// @desc Get staff for marking attendance
// @access Private (Admin)
router.get('/staff-list', auth, authorize('admin'), getStaffForAttendance);

// @route GET api/attendance
// @desc Get attendance records with filters
// @access Private (Admin/Staff)
router.get('/', auth, authorize('admin', 'staff'), getAttendanceRecords);

// @route GET api/attendance/my
// @desc Get personal attendance history
// @access Private (Student/Alumni/Staff/Admin)
router.get('/my', auth, getMyAttendance);

// @route POST api/attendance/unmark
// @desc Unmark attendance record
// @access Private (Admin/Staff)
router.post('/unmark', auth, authorize('admin', 'staff'), unmarkAttendance);

export default router;
