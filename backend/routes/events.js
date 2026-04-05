import express from 'express';
import { auth } from '../middleware/auth.js';
import { 
  createEvent, 
  getAllEvents, 
  getUpcomingEvents, 
  deleteEvent 
} from '../controllers/eventController.js';

const router = express.Router();

// @route POST api/events
// @desc Create a new campus event
// @access Private (Admin/Staff)
router.post('/', auth, createEvent);

// @route GET api/events
// @desc Get all events with optional start/end filter
// @access Private
router.get('/', auth, getAllEvents);

// @route GET api/events/upcoming
// @desc Get upcoming 5 events
// @access Private
router.get('/upcoming', auth, getUpcomingEvents);

// @route DELETE api/events/:id
// @desc Delete an event
// @access Private (Creator/Admin)
router.delete('/:id', auth, deleteEvent);

export default router;
