import Student from '../models/Student.js';
import { createLogEntry } from '../middleware/logging.js';
import { LOG_ACTIONS, LOG_MODULES, RESPONSE_MESSAGES } from '../utils/constants.js';

// @desc    Get all students with filtering
// @route   GET /api/students
// @access  Private
const getStudents = async (req, res) => {
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
};

// @desc    Get student by ID
// @route   GET /api/students/:id
// @access  Private
const getStudent = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id)
      .populate('hostel')
      .populate('room');
    
    if (!student) {
      return res.status(404).json({ message: RESPONSE_MESSAGES.NOT_FOUND });
    }
    
    res.json(student);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a new student
// @route   POST /api/students
// @access  Private/Admin
const createStudent = async (req, res) => {
  try {
    const studentData = { ...req.body };
    
    if (studentData.address) {
      studentData.address = JSON.parse(studentData.address);
    }
    if (studentData.guardian) {
      studentData.guardian = JSON.parse(studentData.guardian);
    }
    
    if (req.file) {
      studentData.photo = `/uploads/${req.file.filename}`;
    }
    
    const student = new Student(studentData);
    await student.save();
    
    // Log student creation
    await createLogEntry({
      action: LOG_ACTIONS.CREATE,
      module: LOG_MODULES.STUDENT,
      description: `New student created: ${student.firstName} ${student.lastName} (${student.studentId})`,
      performedBy: req.user._id,
      targetId: student._id,
      targetModel: LOG_MODULES.STUDENT,
      changes: studentData
    });
    
    res.status(201).json(student);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update student
// @route   PUT /api/students/:id
// @access  Private/Admin
const updateStudent = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    
    if (!student) {
      return res.status(404).json({ message: RESPONSE_MESSAGES.NOT_FOUND });
    }
    
    const updateData = { ...req.body };
    
    if (updateData.address) {
      updateData.address = JSON.parse(updateData.address);
    }
    if (updateData.guardian) {
      updateData.guardian = JSON.parse(updateData.guardian);
    }
    
    if (req.file) {
      updateData.photo = `/uploads/${req.file.filename}`;
    }
    
    const updatedStudent = await Student.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );
    
    // Log student update
    await createLogEntry({
      action: LOG_ACTIONS.UPDATE,
      module: LOG_MODULES.STUDENT,
      description: `Student updated: ${student.firstName} ${student.lastName} (${student.studentId})`,
      performedBy: req.user._id,
      targetId: student._id,
      targetModel: LOG_MODULES.STUDENT,
      changes: updateData
    });
    
    res.json(updatedStudent);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete student
// @route   DELETE /api/students/:id
// @access  Private/Admin
const deleteStudent = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    
    if (!student) {
      return res.status(404).json({ message: RESPONSE_MESSAGES.NOT_FOUND });
    }
    
    await Student.findByIdAndDelete(req.params.id);
    
    // Log student deletion
    await createLogEntry({
      action: LOG_ACTIONS.DELETE,
      module: LOG_MODULES.STUDENT,
      description: `Student deleted: ${student.firstName} ${student.lastName} (${student.studentId})`,
      performedBy: req.user._id,
      targetId: student._id,
      targetModel: LOG_MODULES.STUDENT
    });
    
    res.json({ message: RESPONSE_MESSAGES.DELETED });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Upload student documents
// @route   POST /api/students/:id/documents
// @access  Private/Admin
const uploadDocuments = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    
    if (!student) {
      return res.status(404).json({ message: RESPONSE_MESSAGES.NOT_FOUND });
    }
    
    const documents = req.files.map(file => ({
      name: file.originalname,
      url: `/uploads/${file.filename}`
    }));
    
    student.documents.push(...documents);
    await student.save();
    
    // Log document upload
    await createLogEntry({
      action: LOG_ACTIONS.UPDATE,
      module: LOG_MODULES.STUDENT,
      description: `Documents uploaded for student: ${student.firstName} ${student.lastName}`,
      performedBy: req.user._id,
      targetId: student._id,
      targetModel: LOG_MODULES.STUDENT,
      changes: { documents: documents.map(d => d.name) }
    });
    
    res.json(student);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get student statistics
// @route   GET /api/students/stats/overview
// @access  Private/Admin
const getStudentStats = async (req, res) => {
  try {
    const stats = await Student.aggregate([
      {
        $group: {
          _id: null,
          totalStudents: { $sum: 1 },
          activeStudents: { $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] } },
          inactiveStudents: { $sum: { $cond: [{ $eq: ['$status', 'inactive'] }, 1, 0] } },
          completedStudents: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } }
        }
      }
    ]);
    
    const courseStats = await Student.aggregate([
      {
        $group: {
          _id: '$course',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);
    
    const semesterStats = await Student.aggregate([
      {
        $group: {
          _id: '$semester',
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    
    res.json({
      overall: stats[0] || {
        totalStudents: 0,
        activeStudents: 0,
        inactiveStudents: 0,
        completedStudents: 0
      },
      byCourse: courseStats,
      bySemester: semesterStats
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export {
  getStudents,
  getStudent,
  createStudent,
  updateStudent,
  deleteStudent,
  uploadDocuments,
  getStudentStats
};