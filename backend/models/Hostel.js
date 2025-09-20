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

const hostelSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  type: {
    type: String,
    enum: ['boys', 'girls'],
    required: true
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String
  },
  warden: {
    name: String,
    contact: String,
    email: String
  },
  totalRooms: {
    type: Number,
    required: true,
    min: 1
  },
  occupiedRooms: {
    type: Number,
    default: 0
  },
  availableRooms: {
    type: Number,
    default: function() {
      return this.totalRooms;
    }
  },
  amenities: [String],
  rules: [String],
  status: {
    type: String,
    enum: ['active', 'inactive', 'maintenance'],
    default: 'active'
  }
}, {
  timestamps: true
});

// Virtual for rooms
hostelSchema.virtual('rooms', {
  ref: 'Room',
  localField: '_id',
  foreignField: 'hostel'
});

// Update room counts
hostelSchema.methods.updateRoomCounts = async function() {
  const Room = mongoose.model('Room');
  const roomCounts = await Room.aggregate([
    { $match: { hostel: this._id } },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);
  
  let occupied = 0;
  let available = 0;
  
  roomCounts.forEach(count => {
    if (count._id === 'occupied') {
      occupied = count.count;
    } else if (count._id === 'available') {
      available = count.count;
    }
  });
  
  this.occupiedRooms = occupied;
  this.availableRooms = available;
  return this.save();
};

const Hostel = mongoose.model('Hostel', hostelSchema);
const Room = mongoose.model('Room', roomSchema);

export { Hostel, Room };