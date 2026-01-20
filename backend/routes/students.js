import express from 'express';
import { auth, authorize } from '../middleware/auth.js';
import upload, { handleFileUpload } from '../middleware/upload.js';
import uploadMiddleware from '../middleware/multerMiddlware.js';
import {cloudinaryUpload} from '../lib/cloudinary.js';
import Student from '../models/Student.js';
import { createLogEntry } from '../middleware/logging.js';
import { LOG_ACTIONS, LOG_MODULES, RESPONSE_MESSAGES } from '../utils/constants.js';
import sendStudentEmail from "../scripts/sendStudentRegistrationEmail.js" ;

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
      return res.status(404).json({ message: RESPONSE_MESSAGES.NOT_FOUND });
    }
    
    res.json(student);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/students
// @desc    Create a new student
// @access  Private/Admin
router.post('/', auth, authorize('admin', 'staff'), uploadMiddleware.single("photo"), async (req, res) => {
  try {
    const studentData = { ...req.body };
    
    // Handle address and guardian parsing
    if (studentData.address) {
      try {
        studentData.address = JSON.parse(studentData.address);
      } catch (e) {
        // If it's already an object or invalid, keep as is
      }
    }
    
    if (studentData.guardian) {
      try {
        studentData.guardian = JSON.parse(studentData.guardian);
      } catch (e) {
        // If it's already an object or invalid, keep as is
      }
    }
    
    // Handle file upload (Memory storage + Cloudinary)
    if (req.file) {
      // const fileInfo = await handleFileUpload(req.file, 'students/photos');
      const fileInfo = await cloudinaryUpload(req.file) ; // multer memory storage
      if (fileInfo) {
        studentData.photo = fileInfo.secure_url;
        studentData.photoPublicId = fileInfo.public_id ;
      }
    }
    
    const student = new Student(studentData);
    await student.save();
    res.status(201).json(student);

    setImmediate(async () =>  {
       await sendStudentEmail({
      name: `${student.firstName} ${student.lastName}`,
      course: student.course,
      semester: student.semester,
      student_id: student.studentId,
      email: student.email
    });
    })



    // Log student creation
    // await createLogEntry({
    //   action: LOG_ACTIONS.CREATE,
    //   module: LOG_MODULES.STUDENT,
    //   description: `New student created: ${student.firstName} ${student.lastName} (${student.studentId})`,
    //   performedBy: req.user._id,
    //   targetId: student._id,
    //   targetModel: LOG_MODULES.STUDENT,
    //   changes: studentData
    // });
    
    
  } catch (error) {
    console.error('Create student error:', error);
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
      return res.status(404).json({ message: RESPONSE_MESSAGES.NOT_FOUND });
    }
    
    const updateData = { ...req.body };
    
    // Handle address and guardian parsing
    if (updateData.address) {
      try {
        updateData.address = JSON.parse(updateData.address);
      } catch (e) {
        // If it's already an object or invalid, keep as is
      }
    }
    
    if (updateData.guardian) {
      try {
        updateData.guardian = JSON.parse(updateData.guardian);
      } catch (e) {
        // If it's already an object or invalid, keep as is
      }
    }
    
    // Handle file upload (Memory storage + Cloudinary)
    if (req.file) {
      const fileInfo = await handleFileUpload(req.file, 'students/photos');
      if (fileInfo) {
        updateData.photo = fileInfo.url;
      }
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
    console.error('Update student error:', error);
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
});

// @route   POST /api/students/:id/documents
// @desc    Upload student documents
// @access  Private/Admin
router.post('/:id/documents', auth, authorize('admin', 'staff'), upload.array('documents', 5), async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    
    if (!student) {
      return res.status(404).json({ message: RESPONSE_MESSAGES.NOT_FOUND });
    }
    
    const documents = [];
    for (const file of req.files) {
      const fileInfo = await handleFileUpload(file, 'students/documents');
      if (fileInfo) {
        documents.push({
          name: file.originalname,
          url: fileInfo.url
        });
      }
    }
    
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
    console.error('Upload documents error:', error);
    res.status(400).json({ message: error.message });
  }
});

export default router;