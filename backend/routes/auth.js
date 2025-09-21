import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';
import { auth, authorize } from '../middleware/auth.js';
import { createLogEntry } from '../middleware/logging.js';
import { LOG_ACTIONS, LOG_MODULES, RESPONSE_MESSAGES } from '../utils/constants.js';
import { sendWelcomeEmail } from '../utils/emailService.js';
import { generatePassword } from '../utils/helpers.js';

const router = express.Router();

// @route   POST /api/auth/register
// @desc    Register a new user
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

// @route   POST /api/auth/login
// @desc    Auth user & get token
// @access  Public
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (user && (await user.comparePassword(password))) {
      // Check if user is active
      if (!user.isActive) {
        return res.status(401).json({ message: 'Account is deactivated' });
      }

      // Update last login
      user.lastLogin = new Date();
      await user.save();

      // Log the login
      await createLogEntry({
        action: LOG_ACTIONS.LOGIN,
        module: LOG_MODULES.AUTH,
        description: `User logged in: ${email}`,
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
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: RESPONSE_MESSAGES.INVALID_CREDENTIALS });
    }
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
    res.json(req.user);
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