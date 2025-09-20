import express from 'express';
import { auth, authorize } from '../middleware/auth.js';
import { Hostel, Room } from '../models/Hostel.js';
import Student from '../models/Student.js';

const router = express.Router();

// @route   GET /api/hostels
// @desc    Get all hostels
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const hostels = await Hostel.find().populate('rooms');
    res.json(hostels);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/hostels/:id
// @desc    Get hostel by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const hostel = await Hostel.findById(req.params.id).populate('rooms');
    
    if (!hostel) {
      return res.status(404).json({ message: 'Hostel not found' });
    }
    
    res.json(hostel);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/hostels
// @desc    Create a new hostel
// @access  Private/Admin
router.post('/', auth, authorize('admin'), async (req, res) => {
  try {
    const hostel = new Hostel(req.body);
    await hostel.save();
    res.status(201).json(hostel);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @route   PUT /api/hostels/:id
// @desc    Update hostel
// @access  Private/Admin
router.put('/:id', auth, authorize('admin'), async (req, res) => {
  try {
    const hostel = await Hostel.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!hostel) {
      return res.status(404).json({ message: 'Hostel not found' });
    }
    
    res.json(hostel);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @route   DELETE /api/hostels/:id
// @desc    Delete hostel
// @access  Private/Admin
router.delete('/:id', auth, authorize('admin'), async (req, res) => {
  try {
    const hostel = await Hostel.findById(req.params.id);
    
    if (!hostel) {
      return res.status(404).json({ message: 'Hostel not found' });
    }
    
    // Check if hostel has rooms with students
    const roomsWithStudents = await Room.find({ 
      hostel: hostel._id, 
      currentOccupancy: { $gt: 0 } 
    });
    
    if (roomsWithStudents.length > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete hostel with allocated students' 
      });
    }
    
    // Delete all rooms associated with the hostel
    await Room.deleteMany({ hostel: hostel._id });
    
    // Delete the hostel
    await Hostel.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'Hostel removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/hostels/:id/rooms
// @desc    Get all rooms in a hostel
// @access  Private
router.get('/:id/rooms', auth, async (req, res) => {
  try {
    const { status, floor, available } = req.query;
    
    const query = { hostel: req.params.id };
    
    if (status) query.status = status;
    if (floor) query.floor = parseInt(floor);
    if (available === 'true') {
      query.status = 'available';
      query.currentOccupancy = { $lt: '$capacity' };
    }
    
    const rooms = await Room.find(query)
      .populate('hostel')
      .sort({ floor: 1, roomNumber: 1 });
    
    res.json(rooms);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/hostels/:id/rooms
// @desc    Create a new room in a hostel
// @access  Private/Admin
router.post('/:id/rooms', auth, authorize('admin'), async (req, res) => {
  try {
    const hostel = await Hostel.findById(req.params.id);
    
    if (!hostel) {
      return res.status(404).json({ message: 'Hostel not found' });
    }
    
    const room = new Room({
      ...req.body,
      hostel: hostel._id
    });
    
    await room.save();
    
    // Update hostel room counts
    await hostel.updateRoomCounts();
    
    res.status(201).json(room);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @route   PUT /api/hostels/rooms/:roomId
// @desc    Update room
// @access  Private/Admin
router.put('/rooms/:roomId', auth, authorize('admin'), async (req, res) => {
  try {
    const room = await Room.findByIdAndUpdate(
      req.params.roomId,
      req.body,
      { new: true, runValidators: true }
    ).populate('hostel');
    
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }
    
    // Update hostel room counts
    await room.hostel.updateRoomCounts();
    
    res.json(room);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @route   DELETE /api/hostels/rooms/:roomId
// @desc    Delete room
// @access  Private/Admin
router.delete('/rooms/:roomId', auth, authorize('admin'), async (req, res) => {
  try {
    const room = await Room.findById(req.params.roomId);
    
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }
    
    if (room.currentOccupancy > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete room with allocated students' 
      });
    }
    
    await Room.findByIdAndDelete(req.params.roomId);
    
    // Update hostel room counts
    const hostel = await Hostel.findById(room.hostel);
    await hostel.updateRoomCounts();
    
    res.json({ message: 'Room removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/hostels/allocate
// @desc    Allocate hostel room to student
// @access  Private/Admin
router.post('/allocate', auth, authorize('admin', 'staff'), async (req, res) => {
  try {
    const { studentId, roomId } = req.body;
    
    const student = await Student.findOne({ studentId });
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    
    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }
    
    // Check if room is available
    if (!room.isAvailable()) {
      return res.status(400).json({ message: 'Room is not available' });
    }
    
    // Check if student is already allocated to a room
    if (student.hostel && student.room) {
      return res.status(400).json({ 
        message: 'Student is already allocated to a room' 
      });
    }
    
    // Check gender compatibility
    const hostel = await Hostel.findById(room.hostel);
    if (hostel.type === 'boys' && student.gender !== 'male') {
      return res.status(400).json({ 
        message: 'Female students cannot be allocated to boys hostel' 
      });
    }
    
    if (hostel.type === 'girls' && student.gender !== 'female') {
      return res.status(400).json({ 
        message: 'Male students cannot be allocated to girls hostel' 
      });
    }
    
    // Allocate room to student
    student.hostel = room.hostel;
    student.room = room._id;
    await student.save();
    
    // Update room occupancy
    await room.addStudent();
    
    // Update hostel room counts
    await hostel.updateRoomCounts();
    
    res.json({ 
      message: 'Room allocated successfully',
      student,
      room 
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @route   POST /api/hostels/deallocate
// @desc    Deallocate hostel room from student
// @access  Private/Admin
router.post('/deallocate', auth, authorize('admin', 'staff'), async (req, res) => {
  try {
    const { studentId } = req.body;
    
    const student = await Student.findOne({ studentId }).populate('room');
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    
    if (!student.room) {
      return res.status(400).json({ 
        message: 'Student is not allocated to any room' 
      });
    }
    
    const room = await Room.findById(student.room);
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }
    
    // Deallocate room from student
    student.hostel = undefined;
    student.room = undefined;
    await student.save();
    
    // Update room occupancy
    await room.removeStudent();
    
    // Update hostel room counts
    const hostel = await Hostel.findById(room.hostel);
    await hostel.updateRoomCounts();
    
    res.json({ 
      message: 'Room deallocated successfully',
      student 
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @route   GET /api/hostels/stats/occupancy
// @desc    Get hostel occupancy statistics
// @access  Private/Admin
router.get('/stats/occupancy', auth, authorize('admin'), async (req, res) => {
  try {
    const occupancyStats = await Hostel.aggregate([
      {
        $project: {
          name: 1,
          type: 1,
          totalRooms: 1,
          occupiedRooms: 1,
          availableRooms: 1,
          occupancyRate: {
            $multiply: [
              { $divide: ['$occupiedRooms', '$totalRooms'] },
              100
            ]
          }
        }
      },
      { $sort: { name: 1 } }
    ]);
    
    res.json(occupancyStats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;