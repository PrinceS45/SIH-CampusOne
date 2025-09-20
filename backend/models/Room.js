import mongoose from 'mongoose';

const roomSchema = new mongoose.Schema({
  hostel: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hostel',
    required: true
  },
  roomNumber: {
    type: String,
    required: true
  },
  floor: {
    type: Number,
    required: true
  },
  capacity: {
    type: Number,
    required: true,
    min: 1,
    max: 6
  },
  currentOccupancy: {
    type: Number,
    default: 0,
    min: 0
  },
  amenities: [String],
  status: {
    type: String,
    enum: ['available', 'occupied', 'maintenance', 'reserved'],
    default: 'available'
  },
  price: {
    type: Number,
    required: true,
    min: 0
  }
}, {
  timestamps: true
});

// Check if room is available
roomSchema.methods.isAvailable = function() {
  return this.status === 'available' && this.currentOccupancy < this.capacity;
};

// Add student to room
roomSchema.methods.addStudent = function() {
  if (this.isAvailable()) {
    this.currentOccupancy += 1;
    if (this.currentOccupancy >= this.capacity) {
      this.status = 'occupied';
    }
    return this.save();
  }
  throw new Error('Room is not available');
};

// Remove student from room
roomSchema.methods.removeStudent = function() {
  if (this.currentOccupancy > 0) {
    this.currentOccupancy -= 1;
    if (this.currentOccupancy < this.capacity) {
      this.status = 'available';
    }
    return this.save();
  }
  throw new Error('No students in this room');
};

// Index for better query performance
roomSchema.index({ hostel: 1, roomNumber: 1 }, { unique: true });
roomSchema.index({ status: 1 });
roomSchema.index({ floor: 1 });

const Room = mongoose.model('Room', roomSchema);

export default Room;