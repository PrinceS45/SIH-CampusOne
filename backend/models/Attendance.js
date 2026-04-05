import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  studentProfile: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student'
  },
  date: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['Present', 'Absent', 'Late'],
    required: true
  },
  type: {
    type: String,
    enum: ['manual', 'machine'],
    default: 'manual'
  },
  markedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  role: {
    type: String,
    enum: ['student', 'staff'],
    required: true
  },
  remarks: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Unique index for Students: per Profile + Date
attendanceSchema.index(
  { studentProfile: 1, date: 1 }, 
  { 
    unique: true, 
    partialFilterExpression: { studentProfile: { $exists: true } } 
  }
);

// Unique index for Staff: per User account + Date
attendanceSchema.index(
  { user: 1, date: 1 }, 
  { 
    unique: true, 
    partialFilterExpression: { role: 'staff' } 
  }
);

const Attendance = mongoose.model('Attendance', attendanceSchema);

export default Attendance;
