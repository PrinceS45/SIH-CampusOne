import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Student from '../models/Student.js'; // Import Student model
import generateToken from '../utils/generateToken.js';
import { auth, authorize } from '../middleware/auth.js';
import { createLogEntry } from '../middleware/logging.js';
import { LOG_ACTIONS, LOG_MODULES, RESPONSE_MESSAGES } from '../utils/constants.js';
import { sendWelcomeEmail } from '../utils/emailService.js';
import { generatePassword } from '../utils/helpers.js';

const router = express.Router();

// @route   POST /api/auth/register
// @desc    Register a new user (Admin only)
// @access  Private/Admin
router.post('/register', auth, authorize('admin'), async (req, res) => {
  try {
    const { name, email, role, department } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: RESPONSE_MESSAGES.DUPLICATE_ERROR });
    }

    // Generate random password
    const password = generatePassword();

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      role,
      department
    });

    if (user) {
      // Send welcome email
      try {
        await sendWelcomeEmail(user, password);
      } catch (emailError) {
        console.error('Error sending welcome email:', emailError);
      }

 // Log the user registration
      await createLogEntry({
        action: LOG_ACTIONS.CREATE,
        module: LOG_MODULES.USER,
        description: `New user registered: ${email} with role ${role}`,
        performedBy: req.user._id,
        targetId: user._id,
        targetModel: LOG_MODULES.USER,
        changes: { name, email, role, department }
      });

      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: RESPONSE_MESSAGES.VALIDATION_ERROR });
    }
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: error.message });
  }
});
router.post('/register/admin/campusone', async (req, res) => {
  try {
    console.log("req aa gye")
    const { name, email, role, password , department } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      console.log("user phele se hai")
      return res.status(400).json({ message: RESPONSE_MESSAGES.DUPLICATE_ERROR });
    }

    // Generate random password

    // Create user
    console.log("user bananen ja rha")
    const user = await User.create({
      name,
      email,
      password,
      role,
      department
    });
    console.log(user) ; 
   if(!user) console.log("user nhi bana")
    if (user) {
      // Send welcome email
      // try {
      //   await sendWelcomeEmail(user, password);
      // } catch (emailError) {
      //   console.error('Error sending welcome email:', emailError);
      // }

 // Log the user registration
    //   await createLogEntry({
    //     action: LOG_ACTIONS.CREATE,
    //     module: LOG_MODULES.USER,
    //     description: `New user registered: ${email} with role ${role}`,
    //  //   performedBy: req.user._id,
    //     targetId: user._id,
    //     targetModel: LOG_MODULES.USER,
    //     changes: { name, email, role, department }
    //   });

      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: RESPONSE_MESSAGES.VALIDATION_ERROR });
    }
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/auth/register/student
// @desc    Student self-registration
// @access  Public
router.post('/register/student', async (req, res) => {
  try {
    const { studentId, email, password, name } = req.body;

    // Validate required fields
    if (!studentId || !email || !password || !name) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Check if student exists in database
    const student = await Student.findOne({ studentId });
    if (!student) {
      return res.status(404).json({ message: 'Student ID not found in our records' });
    }

    // Verify that the provided email matches student's email
    if (student.email.toLowerCase() !== email.toLowerCase()) {
      return res.status(400).json({ 
        message: 'Email does not match student records' 
      });
    }

    // Check if user already exists with this email or studentId
    const existingUser = await User.findOne({ 
      $or: [
        { email: email.toLowerCase() },
        { studentId: studentId }
      ]
    });

    if (existingUser) {
      return res.status(400).json({ 
        message: existingUser.email === email ? 
          'Email already registered' : 
          'Student ID already has an account' 
      });
    }

    // Create student user
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      role: 'student',
      studentId,
      studentProfile: student._id
    });

    // Log student registration
    await createLogEntry({
      action: LOG_ACTIONS.CREATE,
      module: LOG_MODULES.USER,
      description: `Student registered: ${name} (${studentId})`,
      targetId: user._id,
      targetModel: LOG_MODULES.USER,
      changes: { studentId, email, role: 'student' }
    });

    res.status(201).json({
      message: 'Student registration successful',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        studentId: user.studentId,
        studentProfile: student
      },
      token: generateToken(user._id),
    });

  } catch (error) {
    console.error('Student registration error:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// @route   GET /api/auth/student/:studentId/check
// @desc    Check if student exists and get basic info for registration
// @access  Public
router.get('/student/:studentId/check', async (req, res) => {
  try {
    const student = await Student.findOne({ studentId: req.params.studentId });
    
    if (!student) {
      return res.status(404).json({ message: 'Student ID not found' });
    }

    // Check if student already has an account
    const existingUser = await User.findOne({ studentId: req.params.studentId });
    if (existingUser) {
      return res.status(400).json({ message: 'Student already has an account' });
    }

    res.json({
      studentId: student.studentId,
      firstName: student.firstName,
      lastName: student.lastName,
      email: student.email,
      course: student.course,
      branch: student.branch,
      semester: student.semester
    });

  } catch (error) {
    console.error('Student check error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/auth/login
// @desc    Auth user & get token
// @access  Public
router.post('/login', async (req, res) => {
  try {
    const { email, password, studentId } = req.body;

    let user;

    // Allow login with either email or studentId
    if (studentId) {
      user = await User.findOne({ studentId }).populate('studentProfile');
    } else {
      user = await User.findOne({ email: email.toLowerCase() }).populate('studentProfile');
    }

    if (!user) {
      return res.status(401).json({ message: RESPONSE_MESSAGES.INVALID_CREDENTIALS });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({ message: 'Account is deactivated' });
    }

    // Verify password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: RESPONSE_MESSAGES.INVALID_CREDENTIALS });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Log the login
    await createLogEntry({
      action: LOG_ACTIONS.LOGIN,
      module: LOG_MODULES.AUTH,
      description: `User logged in: ${user.email} (${user.role})`,
      performedBy: user._id,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
      studentId: user.studentId,
      studentProfile: user.studentProfile,
      token: generateToken(user._id),
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('studentProfile');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/auth/update
// @desc    Update user profile
// @access  Private
router.put('/update', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;
      user.department = req.body.department || user.department;

      if (req.body.password) {
        user.password = req.body.password;
      }

      const updatedUser = await user.save();

      // Log the profile update
      await createLogEntry({
        action: LOG_ACTIONS.UPDATE,
        module: LOG_MODULES.USER,
        description: `User profile updated: ${user.email}`,
        performedBy: user._id,
        targetId: user._id,
        targetModel: LOG_MODULES.USER,
        changes: req.body
      });

      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        department: updatedUser.department,
        studentId: updatedUser.studentId,
        token: generateToken(updatedUser._id),
      });
    } else {
      res.status(404).json({ message: RESPONSE_MESSAGES.NOT_FOUND });
    }
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: error.message });
  }
});

export default router;