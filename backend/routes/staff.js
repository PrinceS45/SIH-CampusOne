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
import uploadMiddleware from '../middleware/multerMiddlware.js';

const router = express.Router();

// Routes for Staff Management
// All staff routes are protected. Stats and Full List are Admin-only.
router.route('/')
    .get(auth, authorize('admin'), getStaff)
    .post(auth, authorize('admin'), uploadMiddleware.single('photo'), createStaff);

router.get('/stats/overview', auth, authorize('admin'), getStaffStats);

router.route('/:id')
    .get(auth, getStaffById)
    .put(auth, authorize('admin'), uploadMiddleware.single('photo'), updateStaff)
    .delete(auth, authorize('admin'), deleteStaff);

export default router;
