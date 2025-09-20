import Student from '../models/Student.js';
import Fee from '../models/Fee.js';
import Exam from '../models/Exam.js';
import { Hostel } from '../models/Hostel.js';
import { RESPONSE_MESSAGES } from '../utils/constants.js';

// @desc    Get dashboard statistics
// @route   GET /api/dashboard/stats
// @access  Private/Admin
const getDashboardStats = async (req, res) => {
  try {
    // Get student statistics
    const studentStats = await Student.aggregate([
      {
        $group: {
          _id: null,
          totalStudents: { $sum: 1 },
          activeStudents: {
            $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
          },
          inactiveStudents: {
            $sum: { $cond: [{ $eq: ['$status', 'inactive'] }, 1, 0] }
          },
          completedStudents: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          }
        }
      }
    ]);
    
    // Get fee statistics
    const feeStats = await Fee.aggregate([
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$paidAmount' },
          pendingAmount: { $sum: '$balance' },
          totalTransactions: { $sum: 1 }
        }
      }
    ]);
    
    // Get hostel occupancy statistics
    const hostelStats = await Hostel.aggregate([
      {
        $group: {
          _id: null,
          totalHostels: { $sum: 1 },
          totalRooms: { $sum: '$totalRooms' },
          occupiedRooms: { $sum: '$occupiedRooms' }
        }
      }
    ]);
    
    // Get recent activities (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const recentStudents = await Student.countDocuments({
      createdAt: { $gte: sevenDaysAgo }
    });
    
    const recentFees = await Fee.countDocuments({
      paymentDate: { $gte: sevenDaysAgo }
    });
    
    const recentExams = await Exam.countDocuments({
      createdAt: { $gte: sevenDaysAgo }
    });
    
    // Get course-wise student distribution
    const courseDistribution = await Student.aggregate([
      {
        $group: {
          _id: '$course',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);
    
    // Get fee collection by month for the current year
    const currentYear = new Date().getFullYear();
    const feeCollectionByMonth = await Fee.aggregate([
      {
        $match: {
          paymentDate: {
            $gte: new Date(`${currentYear}-01-01`),
            $lte: new Date(`${currentYear}-12-31`)
          }
        }
      },
      {
        $group: {
          _id: { $month: '$paymentDate' },
          totalAmount: { $sum: '$paidAmount' }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    
    // Format the response
    const stats = {
      students: studentStats[0] || {
        totalStudents: 0,
        activeStudents: 0,
        inactiveStudents: 0,
        completedStudents: 0
      },
      fees: feeStats[0] || {
        totalRevenue: 0,
        pendingAmount: 0,
        totalTransactions: 0
      },
      hostels: hostelStats[0] || {
        totalHostels: 0,
        totalRooms: 0,
        occupiedRooms: 0
      },
      recentActivities: {
        students: recentStudents,
        fees: recentFees,
        exams: recentExams
      },
      courseDistribution,
      feeCollectionByMonth: Array(12).fill(0).map((_, i) => {
        const monthData = feeCollectionByMonth.find(m => m._id === i + 1);
        return monthData ? monthData.totalAmount : 0;
      })
    };
    
    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get upcoming fee due dates
// @route   GET /api/dashboard/upcoming-fees
// @access  Private
const getUpcomingFees = async (req, res) => {
  try {
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
    
    const upcomingFees = await Fee.find({
      dueDate: { 
        $gte: new Date(), 
        $lte: sevenDaysFromNow 
      },
      status: { $in: ['pending', 'partial'] }
    })
    .populate('student')
    .sort({ dueDate: 1 })
    .limit(10);
    
    res.json(upcomingFees);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get recent activities across modules
// @route   GET /api/dashboard/recent-activities
// @access  Private
const getRecentActivities = async (req, res) => {
  try {
    const recentStudents = await Student.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('firstName lastName studentId course admissionDate');
    
    const recentFees = await Fee.find()
      .populate('student', 'firstName lastName studentId')
      .sort({ paymentDate: -1 })
      .limit(5)
      .select('receiptNo student paidAmount paymentDate');
    
    const recentExams = await Exam.find()
      .populate('student', 'firstName lastName studentId')
      .sort({ examDate: -1 })
      .limit(5)
      .select('student subject marksObtained grade examDate');
    
    res.json({
      students: recentStudents,
      fees: recentFees,
      exams: recentExams
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export {
  getDashboardStats,
  getUpcomingFees,
  getRecentActivities
};