import mongoose from 'mongoose';

const feeSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  receiptNo: {
    type: String,
    required: true,
    unique: true
  },
  academicYear: {
    type: String,
    required: true
  },
  semester: {
    type: Number,
    required: true
  },
  paymentDate: {
    type: Date,
    default: Date.now
  },
  dueDate: {
    type: Date,
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  paidAmount: {
    type: Number,
    required: true,
    min: 0
  },
  balance: {
    type: Number,
    default: 0
  },
  paymentMode: {
    type: String,
    enum: ['cash', 'card', 'bank transfer', 'upi', 'cheque'],
    required: true
  },
  transactionId: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['paid', 'partial', 'pending', 'overdue'],
    default: 'pending'
  },
  breakdown: [{
    category: String,
    amount: Number
  }],
  collectedBy: {
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

// Generate receipt number before saving
feeSchema.pre('save', async function(next) {
  if (this.isNew) {
    const year = new Date().getFullYear().toString().slice(-2);
    const count = await mongoose.model('Fee').countDocuments();
    this.receiptNo = `RCPT${year}${(count + 1).toString().padStart(5, '0')}`;
    
    // Calculate balance
    this.balance = this.amount - this.paidAmount;
    
    // Update status based on payment
    if (this.paidAmount >= this.amount) {
      this.status = 'paid';
      this.balance = 0;
    } else if (this.paidAmount > 0) {
      this.status = 'partial';
    } else {
      this.status = 'pending';
    }
  }
  next();
});

// Update status if due date passed
feeSchema.methods.checkDueDate = function() {
  if (this.dueDate < new Date() && this.status !== 'paid') {
    this.status = 'overdue';
    return this.save();
  }
  return this;
};

// Index for better query performance
feeSchema.index({ student: 1 });
feeSchema.index({ receiptNo: 1 });
feeSchema.index({ paymentDate: 1 });
feeSchema.index({ status: 1 });

const Fee = mongoose.model('Fee', feeSchema);

export default Fee;