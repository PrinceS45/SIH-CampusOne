import mongoose from 'mongoose';

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
    required: true
  },
  course: {
    type: String,
    required: true
  },
  semester: {
    type: Number,
    required: true
  },
  maximumMarks: {
    type: Number,
    required: true,
    min: 0
  },
  marksObtained: {
    type: Number,
    required: true,
    min: 0
  },
  grade: {
    type: String,
    enum: ['A+', 'A', 'B+', 'B', 'C+', 'C', 'D', 'F', 'I'],
    required: true
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
    required: true
  },
  conductedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  remarks: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

// Calculate grade based on marks
examSchema.pre('save', function(next) {
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

const Exam = mongoose.model('Exam', examSchema);

export default Exam;