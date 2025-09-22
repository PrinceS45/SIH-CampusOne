import express from 'express';
import { auth, authorize } from '../middleware/auth.js';
import Exam from '../models/Exam.js';
import Student from '../models/Student.js';
import { createLogEntry } from '../middleware/logging.js';
import { sendExamResult } from '../utils/emailService.js';
import { LOG_ACTIONS, LOG_MODULES, RESPONSE_MESSAGES } from '../utils/constants.js';

const router = express.Router();


// Add this route for student to get their own exams
// @route   GET /api/exams/my-exams
// @desc    Get logged-in student's exam records
// @access  Private/Student
router.get('/my-exams', auth, async (req, res) => {
  try {
    if (req.user.role !== 'student') {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    const exams = await Exam.find({ student: req.user.studentProfile })
      .populate('conductedBy')
      .sort({ examDate: -1 });
    
    res.json(exams);
  } catch (error) {
    console.error('Error fetching student exams:', error);
    res.status(500).json({ message: 'Server error while fetching exams' });
  }
});

// Modify the existing student exams route to check authorization
// @route   GET /api/exams/student/:studentId
// @desc    Get exam records for a specific student (admin/staff only or student themselves)
// @access  Private
router.get('/student/:studentId', auth, async (req, res) => {
  try {
    // Students can only access their own data
    if (req.user.role === 'student' && req.user.studentId !== req.params.studentId) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    const student = await Student.findOne({ studentId: req.params.studentId });
    
    if (!student) {
      return res.status(404).json({ message: RESPONSE_MESSAGES.NOT_FOUND });
    }
    
    const exams = await Exam.find({ student: student._id })
      .populate('conductedBy')
      .sort({ examDate: -1 });
    
    res.json(exams);
  } catch (error) {
    console.error('Error fetching student exams:', error);
    res.status(500).json({ message: 'Server error while fetching student exams' });
  }
});

// @route   GET /api/exams
// @desc    Get all exam records with filtering
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      studentId, 
      examType, 
      subject, 
      course, 
      semester 
    } = req.query;
    
    const query = {};
    
    if (studentId) {
      const student = await Student.findOne({ studentId });
      if (student) {
        query.student = student._id;
      } else {
        return res.status(404).json({ message: 'Student not found' });
      }
    }
    
    if (examType) query.examType = examType;
    if (subject) query.subject = { $regex: subject, $options: 'i' };
    if (course) query.course = course;
    if (semester) query.semester = parseInt(semester);
    
    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { examDate: -1 },
      populate: ['student', 'conductedBy']
    };
    
    const exams = await Exam.paginate(query, options);
    
    res.json({
      exams: exams.docs,
      totalPages: exams.totalPages,
      currentPage: exams.page,
      totalRecords: exams.totalDocs
    });
  } catch (error) {
    console.error('Error fetching exams:', error);
    res.status(500).json({ message: 'Server error while fetching exams' });
  }
});


// @route   GET /api/exams/:id
// @desc    Get exam record by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id)
      .populate('student')
      .populate('conductedBy');
    
    if (!exam) {
      return res.status(404).json({ message: RESPONSE_MESSAGES.NOT_FOUND });
    }
    
    res.json(exam);
  } catch (error) {
    console.error('Error fetching exam:', error);
    res.status(500).json({ message: 'Server error while fetching exam' });
  }
});

// @route   POST /api/exams
// @desc    Create a new exam record
// @access  Private/Staff
router.post('/', auth, authorize('admin', 'staff'), async (req, res) => {
  try {
    const { studentId, ...examData } = req.body;
    
    // Validate required fields
    if (!studentId || !examData.subject || !examData.maximumMarks || !examData.marksObtained) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    
    // Find student by studentId
    const student = await Student.findOne({ studentId });
    
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    
    const exam = new Exam({
      ...examData,
      student: student._id,
      conductedBy: req.user._id
    });
    
    await exam.save();
    
    // Populate the saved exam with student and conductedBy details
    const populatedExam = await Exam.findById(exam._id)
      .populate('student')
      .populate('conductedBy');
    
    // Send email notification
    try {
      await sendExamResult(populatedExam, student);
    } catch (emailError) {
      console.error('Error sending exam result email:', emailError);
    }
    
    // Log exam creation
    await createLogEntry({
      action: LOG_ACTIONS.CREATE,
      module: LOG_MODULES.EXAM,
      description: `Exam result recorded: ${exam.subject} for ${student.firstName} ${student.lastName}`,
      performedBy: req.user._id,
      targetId: exam._id,
      targetModel: LOG_MODULES.EXAM,
      changes: {
        subject: exam.subject,
        marks: `${exam.marksObtained}/${exam.maximumMarks}`,
        grade: exam.grade
      }
    });
    
    res.status(201).json(populatedExam);
  } catch (error) {
    console.error('Error creating exam:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Server error while creating exam' });
  }
});

// @route   PUT /api/exams/:id
// @desc    Update exam record
// @access  Private/Staff
router.put('/:id', auth, authorize('admin', 'staff'), async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id);
    
    if (!exam) {
      return res.status(404).json({ message: RESPONSE_MESSAGES.NOT_FOUND });
    }
    
    const updatedExam = await Exam.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('student').populate('conductedBy');
    
    // Log exam update
    await createLogEntry({
      action: LOG_ACTIONS.UPDATE,
      module: LOG_MODULES.EXAM,
      description: `Exam result updated: ${exam.subject} for ${exam.student?.firstName}`,
      performedBy: req.user._id,
      targetId: exam._id,
      targetModel: LOG_MODULES.EXAM,
      changes: req.body
    });
    
    res.json(updatedExam);
  } catch (error) {
    console.error('Error updating exam:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Server error while updating exam' });
  }
});

// @route   DELETE /api/exams/:id
// @desc    Delete exam record
// @access  Private/Admin
router.delete('/:id', auth, authorize('admin'), async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id);
    
    if (!exam) {
      return res.status(404).json({ message: RESPONSE_MESSAGES.NOT_FOUND });
    }
    
    await Exam.findByIdAndDelete(req.params.id);
    
    // Log exam deletion
    await createLogEntry({
      action: LOG_ACTIONS.DELETE,
      module: LOG_MODULES.EXAM,
      description: `Exam result deleted: ${exam.subject} for ${exam.student?.firstName}`,
      performedBy: req.user._id,
      targetId: exam._id,
      targetModel: LOG_MODULES.EXAM
    });
    
    res.json({ message: RESPONSE_MESSAGES.DELETED });
  } catch (error) {
    console.error('Error deleting exam:', error);
    res.status(500).json({ message: 'Server error while deleting exam' });
  }
});

// @route   GET /api/exams/stats/performance
// @desc    Get exam performance statistics
// @access  Private/Admin
router.get('/stats/performance', auth, authorize('admin'), async (req, res) => {
  try {
    const { course, semester, subject } = req.query;
    
    const matchStage = {};
    
    if (course) matchStage.course = course;
    if (semester) matchStage.semester = parseInt(semester);
    if (subject) matchStage.subject = { $regex: subject, $options: 'i' };
    
    const performanceStats = await Exam.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: {
            course: '$course',
            semester: '$semester',
            subject: '$subject'
          },
          totalStudents: { $sum: 1 },
          averageMarks: { $avg: '$marksObtained' },
          maxMarks: { $max: '$marksObtained' },
          minMarks: { $min: '$marksObtained' },
          passCount: {
            $sum: { $cond: [{ $eq: ['$status', 'pass'] }, 1, 0] }
          },
          failCount: {
            $sum: { $cond: [{ $eq: ['$status', 'fail'] }, 1, 0] }
          }
        }
      },
      {
        $project: {
          _id: 0,
          course: '$_id.course',
          semester: '$_id.semester',
          subject: '$_id.subject',
          totalStudents: 1,
          averageMarks: { $round: ['$averageMarks', 2] },
          maxMarks: 1,
          minMarks: 1,
          passCount: 1,
          failCount: 1,
          passPercentage: {
            $round: [
              { $multiply: [{ $divide: ['$passCount', '$totalStudents'] }, 100] },
              2
            ]
          }
        }
      },
      { $sort: { course: 1, semester: 1, subject: 1 } }
    ]);
    
    res.json(performanceStats);
  } catch (error) {
    console.error('Error fetching performance stats:', error);
    res.status(500).json({ message: 'Server error while fetching performance stats' });
  }
});

export default router;