import express from 'express';
import { 
    getStaff, 
    getStaffById, 
    createStaff, 
    updateStaff, 
    deleteStaff, 
    getStaffStats 
} from '../controllers/staffController.js';
import { auth, authorize } from '../middleware/auth.js';

const router = express.Router();

// Routes for Staff Management
// All staff routes are protected. Stats and Full List are Admin-only.
router.route('/')
    .get(auth, authorize('admin'), getStaff)
    .post(auth, authorize('admin'), createStaff);

router.get('/stats/overview', auth, authorize('admin'), getStaffStats);

router.route('/:id')
    .get(auth, getStaffById)
    .put(auth, authorize('admin'), updateStaff)
    .delete(auth, authorize('admin'), deleteStaff);

export default router;
