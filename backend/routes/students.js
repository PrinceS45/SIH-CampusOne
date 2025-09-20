import express from 'express';
import { auth, authorize } from '../middleware/auth.js';
import upload from '../middleware/upload.js';
import Student from '../models/Student.js';

const router = express.Router();

// @route   GET /api/students
// @desc    Get all students with filtering
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10, search, course, branch, semester, status } = req.query;
    
    const query = {};
    
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { studentId: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (course) query.course = course;
    if (branch) query.branch = branch;
    if (semester) query.semester = parseInt(semester);
    if (status) query.status = status;
    
    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { createdAt: -1 },
      populate: ['hostel', 'room']
    };
    
    const students = await Student.paginate(query, options);
    
    res.json({
      students: students.docs,
      totalPages: students.totalPages,
      currentPage: students.page,
      totalStudents: students.totalDocs
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/students/:id
// @desc    Get student by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const student = await Student.findById(req.params.id)
      .populate('hostel')
      .populate('room');
    
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    
    res.json(student);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/students
// @desc    Create a new student
// @access  Private/Admin
router.post('/', auth, authorize('admin', 'staff'), upload.single('photo'), async (req, res) => {
  try {
    const studentData = { ...req.body };
    
    if (req.file) {
      studentData.photo = `/uploads/${req.file.filename}`;
    }
    
    const student = new Student(studentData);
    await student.save();
    
    res.status(201).json(student);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @route   PUT /api/students/:id
// @desc    Update student
// @access  Private/Admin
router.put('/:id', auth, authorize('admin', 'staff'), upload.single('photo'), async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    
    const updateData = { ...req.body };
    
    if (req.file) {
      updateData.photo = `/uploads/${req.file.filename}`;
    }
    
    const updatedStudent = await Student.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );
    
    res.json(updatedStudent);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @route   DELETE /api/students/:id
// @desc    Delete student
// @access  Private/Admin
router.delete('/:id', auth, authorize('admin'), async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    
    await Student.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'Student removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/students/:id/documents
// @desc    Upload student documents
// @access  Private/Admin
router.post('/:id/documents', auth, authorize('admin', 'staff'), upload.array('documents', 5), async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    
    const documents = req.files.map(file => ({
      name: file.originalname,
      url: `/uploads/${file.filename}`
    }));
    
    student.documents.push(...documents);
    await student.save();
    
    res.json(student);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

export default router;