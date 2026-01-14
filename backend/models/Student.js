import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';
import Counter from './Counter.js'; // Import the new Counter model

const addressSchema = new mongoose.Schema({
  street: String,
  city: String,
  state: String,
  zip: String,
  country: String
});

const guardianSchema = new mongoose.Schema({
  name: String,
  relationship: String,
  phone: String,
  email: String
});

const documentSchema = new mongoose.Schema({
  name: String,
  url: String,
  uploadedAt: {
    type: Date,
    default: Date.now
  }
});

const studentSchema = new mongoose.Schema({
  studentId: {
    type: String,
    unique: true
  },
  firstName: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  phone: String,
  dateOfBirth: Date,
  gender: String,
  address: addressSchema,
  guardian: guardianSchema,
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
    required: true
  },
  admissionDate: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'completed', 'dropped' ,'suspended'],
    default: 'active'
  },
  photo : {
    type : String , 
  } , 
  photoPublicId : {
    type : String  , 
  } , 
  documents: [documentSchema],
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

// Pre-save hook to auto-generate studentId
studentSchema.pre('save', async function(next) {
  if (this.isNew) {
    try {
      const counter = await Counter.findByIdAndUpdate(
        { _id: 'studentId' },
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
      );
      // Format the ID (e.g., STU-00001)
      this.studentId = `STU-${counter.seq.toString().padStart(5, '0')}`;
      next();
    } catch (error) {
      next(error);
    }
  } else {
    next();
  }
});

studentSchema.plugin(mongoosePaginate);

const Student = mongoose.model('Student', studentSchema);

export default Student;