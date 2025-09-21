import express from 'express';
import { auth, authorize } from '../middleware/auth.js';
import Log from '../models/Log.js';
import { RESPONSE_MESSAGES } from '../utils/constants.js';

const router = express.Router();

// @route   GET /api/logs
// @desc    Get system logs with filtering
// @access  Private/Admin
router.get('/', auth, authorize('admin'), async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 50, 
      module, 
      action, 
      startDate, 
      endDate,
      userId 
    } = req.query;
    
    const query = {};
    
    if (module) query.module = module;
    if (action) query.action = action;
    if (userId) query.performedBy = userId;
    
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }
    
    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { createdAt: -1 },
      populate: 'performedBy'
    };
    
    const logs = await Log.paginate(query, options);
    
    res.json({
      logs: logs.docs,
      totalPages: logs.totalPages,
      currentPage: logs.page,
      totalLogs: logs.totalDocs
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/logs/:id
// @desc    Get log by ID
// @access  Private/Admin
router.get('/:id', auth, authorize('admin'), async (req, res) => {
  try {
    const log = await Log.findById(req.params.id)
      .populate('performedBy', 'name email role');
    
    if (!log) {
      return res.status(404).json({ message: RESPONSE_MESSAGES.NOT_FOUND });
    }
    
    res.json(log);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   DELETE /api/logs/:id
// @desc    Delete log entry
// @access  Private/Admin
router.delete('/:id', auth, authorize('admin'), async (req, res) => {
  try {
    const log = await Log.findById(req.params.id);
    
    if (!log) {
      return res.status(404).json({ message: RESPONSE_MESSAGES.NOT_FOUND });
    }
    
    await Log.findByIdAndDelete(req.params.id);
    
    res.json({ message: RESPONSE_MESSAGES.DELETED });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   DELETE /api/logs
// @desc    Bulk delete logs
// @access  Private/Admin
router.delete('/', auth, authorize('admin'), async (req, res) => {
  try {
    const { days } = req.query;
    
    if (!days || isNaN(days)) {
      return res.status(400).json({ message: 'Days parameter is required and must be a number' });
    }
    
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - parseInt(days));
    
    const result = await Log.deleteMany({
      createdAt: { $lt: cutoffDate }
    });
    
    res.json({
      message: `Deleted ${result.deletedCount} log entries older than ${days} days`,
      deletedCount: result.deletedCount
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/logs/stats/summary
// @desc    Get log statistics summary
// @access  Private/Admin
router.get('/stats/summary', auth, authorize('admin'), async (req, res) => {
  try {
    const { days = 30 } = req.query;
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));
    
    const stats = await Log.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            module: '$module',
            action: '$action'
          },
          count: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: '$_id.module',
          actions: {
            $push: {
              action: '$_id.action',
              count: '$count'
            }
          },
          total: { $sum: '$count' }
        }
      },
      {
        $project: {
          module: '$_id',
          actions: 1,
          total: 1,
          _id: 0
        }
      },
      { $sort: { total: -1 } }
    ]);
    
    // Get top performers
    const topPerformers = await Log.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: '$performedBy',
          count: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      {
        $unwind: '$user'
      },
      {
        $project: {
          _id: 0,
          userId: '$_id',
          name: '$user.name',
          email: '$user.email',
          role: '$user.role',
          actionCount: '$count'
        }
      },
      { $sort: { actionCount: -1 } },
      { $limit: 10 }
    ]);
    
    res.json({
      period: `${days} days`,
      moduleStats: stats,
      topPerformers,
      totalLogs: stats.reduce((sum, module) => sum + module.total, 0)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;