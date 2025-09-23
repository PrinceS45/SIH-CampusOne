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
  status: {  // ← Only one status field!
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

// Add student to room - IMPROVED VERSION
roomSchema.methods.addStudent = async function() {
  if (this.currentOccupancy < this.capacity) {
    this.currentOccupancy += 1;
    
    // Update status based on occupancy
    if (this.currentOccupancy >= this.capacity) {
      this.status = 'occupied';
    } else if (this.currentOccupancy > 0) {
      this.status = 'occupied'; // Change to occupied even if not full
    }
    
    await this.save();
    return this;
  }
  throw new Error('Room is at full capacity');
};

// Remove student from room - IMPROVED VERSION
roomSchema.methods.removeStudent = async function() {
  if (this.currentOccupancy > 0) {
    this.currentOccupancy -= 1;
    
    // Update status based on occupancy
    if (this.currentOccupancy === 0) {
      this.status = 'available';
    } else {
      this.status = 'occupied'; // Still occupied but with space
    }
    
    await this.save();
    return this;
  }
  throw new Error('No students in this room');
};

// Index for better query performance
roomSchema.index({ hostel: 1, roomNumber: 1 }, { unique: true });
roomSchema.index({ status: 1 });
roomSchema.index({ floor: 1 });

const Room = mongoose.model('Room', roomSchema);

export default Room;