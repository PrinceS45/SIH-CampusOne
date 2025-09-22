import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

const examSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  examType: {
    type: String,
    enum: ['midterm', 'final', 'quiz', 'assignment'],
    required: true
  },
  subject: {
    type: String,
    required: true,
    trim: true
  },
  course: {
    type: String,
    required: true
  },
  semester: {
    type: Number,
    required: true,
    min: 1,
    max: 8
  },
  maximumMarks: {
    type: Number,
    required: true,
    min: 1
  },
  marksObtained: {
    type: Number,
    required: true,
    min: 0,
    validate: {
      validator: function(value) {
        return value <= this.maximumMarks;
      },
      message: 'Marks obtained cannot exceed maximum marks'
    }
  },
  grade: {
    type: String,
    enum: ['A+', 'A', 'B+', 'B', 'C+', 'C', 'D', 'F', 'I'],
   // required: true
  },
  examDate: {
    type: Date,
    required: true
  },
  resultDate: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['pass', 'fail', 'absent', 'malpractice'],
   // required: true
  },
  conductedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  remarks: {
    type: String,
    default: '',
    trim: true
  }
}, {
  timestamps: true
});

// Calculate grade based on marks
examSchema.pre('save', function(next) {
  // Handle absent or malpractice cases
  if (this.status === 'absent' || this.status === 'malpractice') {
    this.grade = 'I';
    this.marksObtained = 0;
    return next();
  }
  
  const percentage = (this.marksObtained / this.maximumMarks) * 100;
  
  if (percentage >= 90) this.grade = 'A+';
  else if (percentage >= 80) this.grade = 'A';
  else if (percentage >= 70) this.grade = 'B+';
  else if (percentage >= 60) this.grade = 'B';
  else if (percentage >= 50) this.grade = 'C+';
  else if (percentage >= 40) this.grade = 'C';
  else if (percentage >= 35) this.grade = 'D';
  else this.grade = 'F';
  
  this.status = percentage >= 35 ? 'pass' : 'fail';
  
  next();
});

// Index for better query performance
examSchema.index({ student: 1 });
examSchema.index({ subject: 1 });
examSchema.index({ course: 1, semester: 1 });
examSchema.index({ examDate: -1 });

// Add pagination plugin
examSchema.plugin(mongoosePaginate);

const Exam = mongoose.model('Exam', examSchema);

export default Exam;