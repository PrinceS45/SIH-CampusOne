
import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

const logSchema = new mongoose.Schema({
  // ... your existing schema fields

   action: {
    type: String,
    required: true,
    enum: [
      'create', 'update', 'delete', 'login', 'logout', 
      'fee_payment', 'exam_update', 'hostel_allocation'
    ]
  },
 
  module: {
  type: String,
  required: true,
  enum: ['student', 'fee', 'exam', 'hostel', 'user', 'auth', 'system']
  // Added 'system' to the enum values
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

// Add pagination plugin
logSchema.plugin(mongoosePaginate);

// ... rest of your existing Log model code
// Index for better query performance
logSchema.index({ createdAt: -1 });
logSchema.index({ module: 1, action: 1 });
logSchema.index({ performedBy: 1 });

// Static method to create log entry
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

// Static method to get logs with pagination
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