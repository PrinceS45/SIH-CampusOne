import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

const logSchema = new mongoose.Schema({
  action: {
    type: String,
    required: true,
    enum: [
      'CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'READ',
      'FEE_PAYMENT', 'EXAM_UPDATE', 'HOSTEL_ALLOCATION', 'REQUEST'
    ]
  },
  module: {
    type: String,
    required: true,
    enum: ['STUDENT', 'FEE', 'EXAM', 'HOSTEL', 'USER', 'AUTH', 'SYSTEM']
  },
  description: {
    type: String,
    required: true
  },
  performedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  targetId: {
    type: mongoose.Schema.Types.ObjectId,
    required: false
  },
  targetModel: {
    type: String,
    required: false
  },
  changes: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  ipAddress: {
    type: String,
    required: false
  },
  userAgent: {
    type: String,
    required: false
  }
}, {
  timestamps: true
});

logSchema.plugin(mongoosePaginate);

logSchema.index({ createdAt: -1 });
logSchema.index({ module: 1, action: 1 });
logSchema.index({ performedBy: 1 });

logSchema.statics.createLog = async function(logData) {
  try {
    const log = new this(logData);
    await log.save();
    return log;
  } catch (error) {
    console.error('Error creating log entry:', error);
    throw error;
  }
};

logSchema.statics.getLogs = async function(query = {}, page = 1, limit = 50) {
  try {
    const skip = (page - 1) * limit;
    
    const logs = await this.find(query)
      .populate('performedBy', 'name email role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    const total = await this.countDocuments(query);
    
    return {
      logs,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      totalLogs: total
    };
  } catch (error) {
    console.error('Error fetching logs:', error);
    throw error;
  }
};

const Log = mongoose.model('Log', logSchema);

export default Log;