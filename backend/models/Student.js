import mongoose from 'mongoose';

const studentSchema = new mongoose.Schema({
  studentId: {
    type: String,
    required: true,
    unique: true
  },
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  phone: {
    type: String,
    required: true
  },
  dateOfBirth: {
    type: Date,
    required: true
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other'],
    required: true
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  guardian: {
    name: String,
    relationship: String,
    phone: String,
    email: String
  },
  course: {
    type: String,
    required: true
  },
  branch: {
    type: String,
    required: true
  },
  semester: {
    type: Number,
    required: true,
    min: 1,
    max: 8
  },
  admissionDate: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'completed', 'suspended'],
    default: 'active'
  },
  photo: {
    type: String,
    default: ''
  },
  documents: [{
    name: String,
    url: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  hostel: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hostel'
  },
  room: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room'
  }
}, {
  timestamps: true
});

// Generate student ID before saving
studentSchema.pre('save', async function(next) {
  if (this.isNew) {
    const year = new Date().getFullYear().toString().slice(-2);
    const count = await mongoose.model('Student').countDocuments();
    this.studentId = `STU${year}${(count + 1).toString().padStart(4, '0')}`;
  }
  next();
});

// Index for better query performance
studentSchema.index({ studentId: 1 });
studentSchema.index({ email: 1 });
studentSchema.index({ course: 1, branch: 1, semester: 1 });

const Student = mongoose.model('Student', studentSchema);

export default Student;