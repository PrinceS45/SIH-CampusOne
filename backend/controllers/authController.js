import User from '../models/User.js';
import Log from '../models/Log.js';
import generateToken from '../utils/generateToken.js';
import { createLogEntry } from '../middleware/logging.js';
import { LOG_ACTIONS, LOG_MODULES, RESPONSE_MESSAGES } from '../utils/constants.js';

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Private/Admin
const registerUser = async (req, res) => {
  try {
    const { name, email, password, role, department } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: RESPONSE_MESSAGES.DUPLICATE_ERROR });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      role,
      department
    });

    if (user) {
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
    res.status(500).json({ message: error.message });
  }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (user && (await user.comparePassword(password))) {
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
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
const getCurrentUser = async (req, res) => {
  try {
    res.json(req.user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/update
// @access  Private
const updateUser = async (req, res) => {
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
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all users
// @route   GET /api/auth/users
// @access  Private/Admin
const getUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, role, search } = req.query;
    
    const query = {};
    
    if (role) query.role = role;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    
    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { createdAt: -1 }
    };
    
    const users = await User.paginate(query, options);
    
    res.json({
      users: users.docs,
      totalPages: users.totalPages,
      currentPage: users.page,
      totalUsers: users.totalDocs
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update user by admin
// @route   PUT /api/auth/users/:id
// @access  Private/Admin
const updateUserByAdmin = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: RESPONSE_MESSAGES.NOT_FOUND });
    }
    
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).select('-password');
    
    // Log the admin update
    await createLogEntry({
      action: LOG_ACTIONS.UPDATE,
      module: LOG_MODULES.USER,
      description: `User updated by admin: ${user.email}`,
      performedBy: req.user._id,
      targetId: user._id,
      targetModel: LOG_MODULES.USER,
      changes: req.body
    });
    
    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete user
// @route   DELETE /api/auth/users/:id
// @access  Private/Admin
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: RESPONSE_MESSAGES.NOT_FOUND });
    }
    
    // Prevent self-deletion
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'Cannot delete your own account' });
    }
    
    await User.findByIdAndDelete(req.params.id);
    
    // Log the user deletion
    await createLogEntry({
      action: LOG_ACTIONS.DELETE,
      module: LOG_MODULES.USER,
      description: `User deleted: ${user.email}`,
      performedBy: req.user._id,
      targetId: user._id,
      targetModel: LOG_MODULES.USER
    });
    
    res.json({ message: RESPONSE_MESSAGES.DELETED });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export {
  registerUser,
  loginUser,
  getCurrentUser,
  updateUser,
  getUsers,
  updateUserByAdmin,
  deleteUser
};