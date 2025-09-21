import express from 'express';
import { auth, authorize } from '../middleware/auth.js';
import Fee from '../models/Fee.js';
import Student from '../models/Student.js';
import { createLogEntry } from '../middleware/logging.js';
import { sendFeeReceipt } from '../utils/emailService.js';
import { LOG_ACTIONS, LOG_MODULES, RESPONSE_MESSAGES } from '../utils/constants.js';

const router = express.Router();

// @route   GET /api/fees
// @desc    Get all fee records with filtering
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10, studentId, status, startDate, endDate } = req.query;
    
    const query = {};
    
    if (studentId) {
      const student = await Student.findOne({ studentId });
      if (student) {
        query.student = student._id;
      }
    }
    
    if (status) query.status = status;
    
    if (startDate || endDate) {
      query.paymentDate = {};
      if (startDate) query.paymentDate.$gte = new Date(startDate);
      if (endDate) query.paymentDate.$lte = new Date(endDate);
    }
    
    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { paymentDate: -1 },
      populate: ['student', 'collectedBy']
    };
    
    const fees = await Fee.paginate(query, options);
    
    res.json({
      fees: fees.docs,
      totalPages: fees.totalPages,
      currentPage: fees.page,
      totalRecords: fees.totalDocs
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/fees/student/:studentId
// @desc    Get fee records for a specific student
// @access  Private
router.get('/student/:studentId', auth, async (req, res) => {
  try {
    const student = await Student.findOne({ studentId: req.params.studentId });
    
    if (!student) {
      return res.status(404).json({ message: RESPONSE_MESSAGES.NOT_FOUND });
    }
    
    const fees = await Fee.find({ student: student._id })
      .populate('collectedBy')
      .sort({ paymentDate: -1 });
    
    res.json(fees);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/fees/:id
// @desc    Get fee record by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const fee = await Fee.findById(req.params.id)
      .populate('student')
      .populate('collectedBy');
    
    if (!fee) {
      return res.status(404).json({ message: RESPONSE_MESSAGES.NOT_FOUND });
    }
    
    res.json(fee);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/fees
// @desc    Create a new fee payment
// @access  Private/Staff
router.post('/', auth, authorize('admin', 'staff'), async (req, res) => {
  try {
    const { studentId, ...feeData } = req.body;
    
    // Find student by studentId
    const student = await Student.findOne({ studentId });
    
    if (!student) {
      return res.status(404).json({ message: RESPONSE_MESSAGES.NOT_FOUND });
    }
    
    const fee = new Fee({
      ...feeData,
      student: student._id,
      collectedBy: req.user._id
    });
    
    await fee.save();
    
    // Populate the saved fee with student and collectedBy details
    const populatedFee = await Fee.findById(fee._id)
      .populate('student')
      .populate('collectedBy');
    
    // Send email receipt
    try {
      await sendFeeReceipt(populatedFee, student);
    } catch (emailError) {
      console.error('Error sending fee receipt email:', emailError);
    }
    
    // Log fee payment
    await createLogEntry({
      action: LOG_ACTIONS.FEE_PAYMENT,
      module: LOG_MODULES.FEE,
      description: `Fee payment collected: ${fee.receiptNo} for ${student.firstName} ${student.lastName}`,
      performedBy: req.user._id,
      targetId: fee._id,
      targetModel: LOG_MODULES.FEE,
      changes: {
        amount: fee.amount,
        paidAmount: fee.paidAmount,
        receiptNo: fee.receiptNo
      }
    });
    
    res.status(201).json(populatedFee);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @route   PUT /api/fees/:id
// @desc    Update fee record
// @access  Private/Staff
router.put('/:id', auth, authorize('admin', 'staff'), async (req, res) => {
  try {
    const fee = await Fee.findById(req.params.id);
    
    if (!fee) {
      return res.status(404).json({ message: RESPONSE_MESSAGES.NOT_FOUND });
    }
    
    const updatedFee = await Fee.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('student').populate('collectedBy');
    
    // Log fee update
    await createLogEntry({
      action: LOG_ACTIONS.UPDATE,
      module: LOG_MODULES.FEE,
      description: `Fee record updated: ${fee.receiptNo}`,
      performedBy: req.user._id,
      targetId: fee._id,
      targetModel: LOG_MODULES.FEE,
      changes: req.body
    });
    
    res.json(updatedFee);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @route   DELETE /api/fees/:id
// @desc    Delete fee record
// @access  Private/Admin
router.delete('/:id', auth, authorize('admin'), async (req, res) => {
  try {
    const fee = await Fee.findById(req.params.id);
    
    if (!fee) {
      return res.status(404).json({ message: RESPONSE_MESSAGES.NOT_FOUND });
    }
    
    await Fee.findByIdAndDelete(req.params.id);
    
    // Log fee deletion
    await createLogEntry({
      action: LOG_ACTIONS.DELETE,
      module: LOG_MODULES.FEE,
      description: `Fee record deleted: ${fee.receiptNo}`,
      performedBy: req.user._id,
      targetId: fee._id,
      targetModel: LOG_MODULES.FEE
    });
    
    res.json({ message: RESPONSE_MESSAGES.DELETED });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/fees/stats/overview
// @desc    Get fee statistics overview
// @access  Private/Admin
router.get('/stats/overview', auth, authorize('admin'), async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const matchStage = {};
    
    if (startDate || endDate) {
      matchStage.paymentDate = {};
      if (startDate) matchStage.paymentDate.$gte = new Date(startDate);
      if (endDate) matchStage.paymentDate.$lte = new Date(endDate);
    }
    
    const stats = await Fee.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: '$amount' },
          totalPaid: { $sum: '$paidAmount' },
          totalBalance: { $sum: '$balance' },
          totalTransactions: { $sum: 1 },
          paidTransactions: {
            $sum: { $cond: [{ $eq: ['$status', 'paid'] }, 1, 0] }
          },
          pendingTransactions: {
            $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
          },
          partialTransactions: {
            $sum: { $cond: [{ $eq: ['$status', 'partial'] }, 1, 0] }
          },
          overdueTransactions: {
            $sum: { $cond: [{ $eq: ['$status', 'overdue'] }, 1, 0] }
          }
        }
      }
    ]);
    
    // Monthly collection data
    const monthlyData = await Fee.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: { $month: '$paymentDate' },
          totalAmount: { $sum: '$paidAmount' },
          transactionCount: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    
    res.json({
      overview: stats[0] || {
        totalAmount: 0,
        totalPaid: 0,
        totalBalance: 0,
        totalTransactions: 0,
        paidTransactions: 0,
        pendingTransactions: 0,
        partialTransactions: 0,
        overdueTransactions: 0
      },
      monthlyData
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;