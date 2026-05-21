import Staff from '../models/Staff.js';
import User from '../models/User.js';
import { sendWelcomeEmail } from '../utils/emailService.js';
import { createLogEntry } from '../middleware/logging.js';
import { LOG_ACTIONS, LOG_MODULES, RESPONSE_MESSAGES } from '../utils/constants.js';
import { cloudinaryUpload, deleteFromCloudinary } from '../lib/cloudinary.js';
import { generatePassword } from '../utils/helpers.js';

// @desc    Get all staff with filtering
// @route   GET /api/staff
// @access  Private/Admin
const getStaff = async (req, res) => {
    try {
        const { page = 1, limit = 10, search, department, status } = req.query;
        
        const query = {};
        
        if (search) {
            query.$or = [
                { firstName: { $regex: search, $options: 'i' } },
                { lastName: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { staffId: { $regex: search, $options: 'i' } }
            ];
        }
        
        if (department) query.department = { $regex: department, $options: 'i' };
        if (status) query.status = status;
        
        const options = {
            page: parseInt(page),
            limit: parseInt(limit),
            sort: { createdAt: -1 }
        };
        
        const staff = await Staff.paginate(query, options);
        
        res.json({
            staff: staff.docs,
            totalPages: staff.totalPages,
            currentPage: staff.page,
            totalStaff: staff.totalDocs
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get staff by ID
// @route   GET /api/staff/:id
// @access  Private
const getStaffById = async (req, res) => {
    try {
        const staff = await Staff.findById(req.params.id);
        
        if (!staff) {
            return res.status(404).json({ message: RESPONSE_MESSAGES.NOT_FOUND });
        }
        
        res.json(staff);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a new staff
// @route   POST /api/staff
// @access  Private/Admin
const createStaff = async (req, res) => {
    try {
        const staffData = { ...req.body };
        
        if (staffData.address && typeof staffData.address === 'string') {
            staffData.address = JSON.parse(staffData.address);
        }
        
        if (req.file) {
            const fileInfo = await cloudinaryUpload(req.file);
            if (fileInfo) {
                staffData.photo = fileInfo.secure_url;
                staffData.photoPublicId = fileInfo.public_id;
            }
        }
        
        const staffExists = await Staff.findOne({ email: staffData.email });
        if (staffExists) {
            return res.status(400).json({ message: "Staff with this email already exists" });
        }
        
        const staff = new Staff(staffData);
        await staff.save();

        // If User already exists with this email, link the staff profile, otherwise create a new User account
        let passwordToSend = "Use your existing account password";
        const existingUser = await User.findOne({ email: staff.email });
        let userToSendMail = existingUser;

        if (existingUser) {
            existingUser.staffProfile = staff._id;
            existingUser.staffId = staff.staffId;
            await existingUser.save();
        } else {
            const password = generatePassword();
            passwordToSend = password;
            userToSendMail = await User.create({
                name: `${staff.firstName} ${staff.lastName}`,
                email: staff.email,
                password,
                role: 'staff',
                department: staff.department,
                staffProfile: staff._id,
                staffId: staff.staffId
            });
        }
        
        // Log staff creation
        await createLogEntry({
            action: LOG_ACTIONS.CREATE,
            module: LOG_MODULES.STAFF,
            description: `New staff created: ${staff.firstName} ${staff.lastName} (${staff.staffId})`,
            performedBy: req.user._id,
            targetId: staff._id,
            targetModel: 'Staff',
            changes: staffData
        });

        // Trigger welcome email
        await sendWelcomeEmail(userToSendMail, passwordToSend);
        
        res.status(201).json(staff);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Update staff
// @route   PUT /api/staff/:id
// @access  Private/Admin
const updateStaff = async (req, res) => {
    try {
        const staff = await Staff.findById(req.params.id);
        
        if (!staff) {
            return res.status(404).json({ message: RESPONSE_MESSAGES.NOT_FOUND });
        }
        
        const updateData = { ...req.body };
        
        if (updateData.address && typeof updateData.address === 'string') {
            updateData.address = JSON.parse(updateData.address);
        }
        
        if (req.file) {
            if (staff.photoPublicId) {
                await deleteFromCloudinary(staff.photoPublicId);
            }
            const fileInfo = await cloudinaryUpload(req.file);
            if (fileInfo) {
                updateData.photo = fileInfo.secure_url;
                updateData.photoPublicId = fileInfo.public_id;
            }
        }
        
        const updatedStaff = await Staff.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true }
        );
        
        // Log staff update
        await createLogEntry({
            action: LOG_ACTIONS.UPDATE,
            module: LOG_MODULES.STAFF,
            description: `Staff updated: ${updatedStaff.staffId}`,
            performedBy: req.user._id,
            targetId: updatedStaff._id,
            targetModel: 'Staff',
            changes: updateData
        });
        
        res.json(updatedStaff);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Delete staff
// @route   DELETE /api/staff/:id
// @access  Private/Admin
const deleteStaff = async (req, res) => {
    try {
        const staff = await Staff.findById(req.params.id);
        
        if (!staff) {
            return res.status(404).json({ message: RESPONSE_MESSAGES.NOT_FOUND });
        }
        
        if (staff.photoPublicId) {
            await deleteFromCloudinary(staff.photoPublicId);
        }
        
        await Staff.findByIdAndDelete(req.params.id);
        
        // Log staff deletion
        await createLogEntry({
            action: LOG_ACTIONS.DELETE,
            module: LOG_MODULES.STAFF,
            description: `Staff deleted: ${staff.staffId}`,
            performedBy: req.user._id,
            targetId: staff._id,
            targetModel: 'Staff'
        });
        
        res.json({ message: RESPONSE_MESSAGES.DELETED });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get staff statistics
// @route   GET /api/staff/stats/overview
// @access  Private/Admin
const getStaffStats = async (req, res) => {
    try {
        const stats = await Staff.aggregate([
            {
                $group: {
                    _id: null,
                    totalStaff: { $sum: 1 },
                    activeStaff: { $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] } },
                    onLeave: { $sum: { $cond: [{ $eq: ['$status', 'on-leave'] }, 1, 0] } }
                }
            }
        ]);
        
        const departmentStats = await Staff.aggregate([
            {
                $group: {
                    _id: '$department',
                    count: { $sum: 1 }
                }
            },
            { $sort: { count: -1 } }
        ]);
        
        res.json({
            overall: stats[0] || {
                totalStaff: 0,
                activeStaff: 0,
                onLeave: 0
            },
            byDepartment: departmentStats
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export {
    getStaff,
    getStaffById,
    createStaff,
    updateStaff,
    deleteStaff,
    getStaffStats
};
